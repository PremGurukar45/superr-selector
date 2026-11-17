"""
main.py
Master execution script for SupeRR Selector Season 2 — Round 1.
Runs the entire end-to-end pipeline:
1. Data loading & validation
2. Preprocessing & match state tracking
3. Pressure performance modeling (Batting & Bowling)
4. Player ranking generation & CSV exports
5. Publication-grade visualization creation
6. Automated integrity testing & mathematical validation
"""

import sys
import time
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from preprocess import load_raw_data, clean_and_enrich_deliveries
from pressure_analysis import analyze_batting_pressure, analyze_bowling_pressure
from rank_players import build_and_export_rankings
from visualizations import generate_all_visualizations

OUTPUT_DIR = PROJECT_ROOT / "output"
REPORTS_DIR = PROJECT_ROOT / "reports"


def run_validation_tests(enriched_df, matches_ctx, top10_bat, top10_bowl, batters_all, bowlers_all):
    """Executes rigorous validation checks on calculations, data integrity, and outputs."""
    print("\n" + "=" * 70)
    print("RUNNING AUTOMATED TEST SUITE & VALIDATION CHECKS")
    print("=" * 70)

    # Test 1: Delivery count
    assert len(enriched_df) == 200999, f"Expected 200,999 deliveries, got {len(enriched_df)}"
    print("[PASS] Test 1: Full delivery count verified (200,999 rows).")

    # Test 2: Legal delivery classification
    legal_overs = enriched_df.groupby(['match_id', 'innings', 'overid'])['is_legal'].sum()
    assert (legal_overs <= 7).all(), "Found an over with more than 7 legal balls!"
    print("[PASS] Test 2: Delivery legality accounting verified.")

    # Test 3: Bowler wicket attribution
    bowler_w_count = enriched_df['is_bowler_wicket'].sum()
    total_w_count = enriched_df['is_wicket'].sum()
    assert bowler_w_count < total_w_count, "Bowler wickets must exclude run outs and retirements."
    runouts = (enriched_df['dismissal_type'] == 'RunOut').sum()
    assert total_w_count - bowler_w_count >= runouts, "Run outs must not be credited to bowlers."
    print(f"[PASS] Test 3: Wicket attribution verified ({bowler_w_count:,} bowler wickets, {total_w_count:,} total).")

    # Test 4: Pressure Index Bounds
    assert (enriched_df['pressure_index'] >= 0.0).all() and (enriched_df['pressure_index'] <= 1.0).all(), "Pressure index out of [0, 1] bounds!"
    hp_pct = enriched_df['is_high_pressure'].mean() * 100
    assert 25.0 <= hp_pct <= 55.0, f"High pressure proportion {hp_pct:.1f}% outside reasonable bounds!"
    print(f"[PASS] Test 4: Continuous Pressure Index within bounds (High Pressure: {hp_pct:.1f}%).")

    # Test 5: Rankings Validity & Uniqueness
    assert len(top10_bat) == 10, "Top 10 Batters does not contain exactly 10 players!"
    assert top10_bat['player_id'].nunique() == 10, "Top 10 Batters contains duplicate players!"
    assert len(top10_bowl) == 10, "Top 10 Bowlers does not contain exactly 10 players!"
    assert top10_bowl['player_id'].nunique() == 10, "Top 10 Bowlers contains duplicate players!"
    print("[PASS] Test 5: Top 10 rankings uniqueness and cardinality verified.")

    # Test 6: Qualification minimums
    assert (top10_bat['balls_faced'] >= 150).all(), "A ranked batter has under 150 pressure balls!"
    assert (top10_bowl['legal_balls'] >= 150).all(), "A ranked bowler has under 150 pressure balls!"
    print("[PASS] Test 6: Sample size qualification thresholds satisfied.")

    # Test 7: Output file verification
    expected_files = [
        OUTPUT_DIR / "top_10_batters_under_pressure.csv",
        OUTPUT_DIR / "top_10_bowlers_under_pressure.csv",
        OUTPUT_DIR / "all_qualified_batters_pressure_metrics.csv",
        OUTPUT_DIR / "all_qualified_bowlers_pressure_metrics.csv",
        OUTPUT_DIR / "batters_top10_comparison.png",
        OUTPUT_DIR / "bowlers_top10_comparison.png",
        OUTPUT_DIR / "batting_pressure_vs_baseline.png",
        OUTPUT_DIR / "bowling_pressure_vs_baseline.png",
        OUTPUT_DIR / "pressure_distribution_by_stage.png",
        REPORTS_DIR / "METHODOLOGY_REPORT.md"
    ]
    for ef in expected_files:
        assert ef.exists() and ef.stat().st_size > 0, f"Expected output file {ef.name} is missing or empty!"
    print(f"[PASS] Test 7: All {len(expected_files)} output artifacts verified present and non-empty.")

    print("=" * 70)
    print("ALL 7 VALIDATION SUITE TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


def main():
    start_time = time.time()
    print("=" * 70)
    print("SUPERR SELECTOR SEASON 2 — ROUND 1 MASTER PIPELINE")
    print("=" * 70)

    # 1. Load Data
    print("\n[Step 1/5] Loading raw datasets...")
    comps, teams, matches, p11, mapping, bbb = load_raw_data()
    print(f"Loaded {len(matches):,} matches and {len(bbb):,} deliveries.")

    # 2. Preprocess & Enrich
    print("\n[Step 2/5] Cleaning deliveries, computing match state & pressure index...")
    enriched_df, matches_ctx = clean_and_enrich_deliveries(matches, bbb, mapping)
    print(f"Computed cumulative state and pressure index across {len(enriched_df):,} balls.")

    # 3. Pressure Analysis
    print("\n[Step 3/5] Performing pressure analysis & Bayesian shrinkage...")
    batters_all = analyze_batting_pressure(enriched_df)
    bowlers_all = analyze_bowling_pressure(enriched_df)
    print(f"Analyzed {len(batters_all)} qualified batters and {len(bowlers_all)} qualified bowlers.")

    # 4. Rank Players & Export CSVs
    print("\n[Step 4/5] Generating official Top 10 rankings & exporting CSVs...")
    top10_bat, top10_bowl = build_and_export_rankings(batters_all, bowlers_all)

    # 5. Visualizations
    print("\n[Step 5/5] Generating publication-quality charts...")
    generate_all_visualizations(enriched_df, batters_all, bowlers_all, top10_bat, top10_bowl)

    # Run Automated Validation Tests
    run_validation_tests(enriched_df, matches_ctx, top10_bat, top10_bowl, batters_all, bowlers_all)

    # Executive Summary Output
    print("\n" + "=" * 70)
    print("FINAL OFFICIAL RANKINGS SUMMARY")
    print("=" * 70)

    print("\nTOP 10 BATTERS UNDER PRESSURE:")
    print("-" * 70)
    print(top10_bat[['rank', 'player_name', 'balls_faced', 'runs_scored', 'strike_rate', 'average', 'delta_sr', 'pressure_score']].to_string(index=False))

    print("\nTOP 10 BOWLERS UNDER PRESSURE:")
    print("-" * 70)
    print(top10_bowl[['rank', 'player_name', 'legal_balls', 'runs_conceded', 'wickets', 'economy_rate', 'dot_percent', 'pressure_score']].to_string(index=False))

    elapsed = time.time() - start_time
    print("\n" + "=" * 70)
    print(f"PIPELINE COMPLETED SUCCESSFULLY IN {elapsed:.2f} SECONDS!")
    print("=" * 70)


if __name__ == "__main__":
    main()
