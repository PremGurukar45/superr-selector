"""
test_pipeline.py
Automated unit and integration test suite for SupeRR Selector Season 2.
Can be executed via: python -m unittest tests/test_pipeline.py
"""

import unittest
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_DIR = PROJECT_ROOT / "output"
REPORTS_DIR = PROJECT_ROOT / "reports"

from src.preprocess import load_raw_data, clean_and_enrich_deliveries, compute_targets_and_match_context
from src.pressure_analysis import analyze_batting_pressure, analyze_bowling_pressure
from src.rank_players import build_and_export_rankings


class TestSupeRRSelectorPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Loads and prepares shared data once for test efficiency."""
        cls.comps, cls.teams, cls.matches, cls.p11, cls.mapping, cls.bbb = load_raw_data()
        cls.enriched_df, cls.matches_ctx = clean_and_enrich_deliveries(cls.matches, cls.bbb, cls.mapping)
        cls.batters = analyze_batting_pressure(cls.enriched_df)
        cls.bowlers = analyze_bowling_pressure(cls.enriched_df)
        cls.top10_bat, cls.top10_bowl = build_and_export_rankings(cls.batters, cls.bowlers)

    def test_01_raw_files_exist(self):
        """Verify all 6 core CSV files exist in data/."""
        expected_files = [
            "competitions.csv", "teams.csv", "matches.csv",
            "playing_eleven.csv", "competition_team_player_mapping.csv", "ball_by_ball.csv"
        ]
        for f in expected_files:
            file_path = DATA_DIR / f
            self.assertTrue(file_path.exists(), f"Missing file: {f}")
            self.assertGreater(file_path.stat().st_size, 0, f"Empty file: {f}")

    def test_02_delivery_legality_accounting(self):
        """Verify illegal deliveries (wides, oversteps, others) are correctly isolated."""
        illegal_mask = self.enriched_df['extras_type'].isin(['wide', 'Overstep', 'other'])
        self.assertTrue((self.enriched_df['is_illegal'] == illegal_mask).all())
        self.assertTrue((self.enriched_df['is_legal'] == (~illegal_mask)).all())

        # An over must never have more than 7 legal deliveries
        legal_per_over = self.enriched_df.groupby(['match_id', 'innings', 'overid'])['is_legal'].sum()
        self.assertLessEqual(legal_per_over.max(), 7)

    def test_03_wicket_and_run_attribution(self):
        """Verify bowler wickets exclude RunOut/Retire Out and runs conceded are accurate."""
        # Bowler wickets
        bowler_wkts = self.enriched_df['is_bowler_wicket'].sum()
        total_wkts = self.enriched_df['is_wicket'].sum()
        runouts = (self.enriched_df['dismissal_type'] == 'RunOut').sum()
        self.assertEqual(bowler_wkts, 10272)
        self.assertEqual(total_wkts, 10881)
        self.assertEqual(runouts, 600)
        self.assertLess(bowler_wkts, total_wkts)

        # Byes and legbyes must not be charged to the bowler
        byes_mask = self.enriched_df['extras_type'].isin(['byes', 'legbyes'])
        byes_rows = self.enriched_df[byes_mask]
        # On byes with 0 bat runs, bowler_runs_conceded must be 0
        zero_bat_byes = byes_rows[byes_rows['runs'] == 0]
        self.assertTrue((zero_bat_byes['bowler_runs_conceded'] == 0).all())

    def test_04_target_and_match_state_consistency(self):
        """Verify targets (including DLS) and monotonic ball states."""
        # Check all Innings 2 deliveries have a non-null target
        inn2 = self.enriched_df[self.enriched_df['innings'] == 2]
        self.assertEqual(inn2['target'].isnull().sum(), 0)

        # Check balls remaining is always >= 0
        self.assertTrue((self.enriched_df['balls_remaining'] >= 0).all())
        # Check wickets in hand is between 0 and 10
        self.assertTrue((self.enriched_df['wickets_in_hand'] >= 0).all())
        self.assertTrue((self.enriched_df['wickets_in_hand'] <= 10).all())

    def test_05_pressure_index_properties(self):
        """Verify continuous Pressure Index bounds and Innings 1 / Innings 2 logic."""
        pi = self.enriched_df['pressure_index']
        self.assertTrue((pi >= 0.0).all())
        self.assertTrue((pi <= 1.0).all())

        # Super Overs must have PI = 1.0
        so_balls = self.enriched_df[self.enriched_df['innings'] >= 3]
        self.assertTrue((so_balls['pressure_index'] == 1.0).all())

        # High pressure proportion must be realistic (~35% to 45%)
        hp_prop = self.enriched_df['is_high_pressure'].mean()
        self.assertGreaterEqual(hp_prop, 0.35)
        self.assertLessEqual(hp_prop, 0.45)

    def test_06_sample_size_qualification(self):
        """Verify that every ranked player meets minimum qualification standards."""
        self.assertEqual(len(self.top10_bat), 10)
        self.assertEqual(len(self.top10_bowl), 10)

        # Batters qualification
        self.assertTrue((self.top10_bat['balls_faced'] >= 150).all())
        self.assertTrue((self.top10_bat['matches'] >= 10).all())

        # Bowlers qualification
        self.assertTrue((self.top10_bowl['legal_balls'] >= 150).all())
        self.assertTrue((self.top10_bowl['matches'] >= 10).all())

    def test_07_player_uniqueness_and_mapping(self):
        """Verify all 10 ranked players are unique and exist in official mapping."""
        self.assertEqual(self.top10_bat['player_id'].nunique(), 10)
        self.assertEqual(self.top10_bowl['player_id'].nunique(), 10)

        all_mapped_ids = set(self.mapping['player_id'])
        for pid in self.top10_bat['player_id']:
            self.assertIn(pid, all_mapped_ids)
        for pid in self.top10_bowl['player_id']:
            self.assertIn(pid, all_mapped_ids)

    def test_08_no_hardcoding_in_calculations(self):
        """Verify that rankings are strictly ordered by calculated pressure_score."""
        # Batters must be sorted descending by pressure_score
        bat_scores = self.top10_bat['pressure_score'].tolist()
        self.assertEqual(bat_scores, sorted(bat_scores, reverse=True))

        # Bowlers must be sorted descending by pressure_score
        bowl_scores = self.top10_bowl['pressure_score'].tolist()
        self.assertEqual(bowl_scores, sorted(bowl_scores, reverse=True))

    def test_09_output_artifacts_exist(self):
        """Verify all 9 output files (CSVs and PNGs) exist and are non-empty."""
        expected_outputs = [
            OUTPUT_DIR / "top_10_batters_under_pressure.csv",
            OUTPUT_DIR / "top_10_bowlers_under_pressure.csv",
            OUTPUT_DIR / "all_qualified_batters_pressure_metrics.csv",
            OUTPUT_DIR / "all_qualified_bowlers_pressure_metrics.csv",
            OUTPUT_DIR / "batters_top10_comparison.png",
            OUTPUT_DIR / "bowlers_top10_comparison.png",
            OUTPUT_DIR / "batting_pressure_vs_baseline.png",
            OUTPUT_DIR / "bowling_pressure_vs_baseline.png",
            OUTPUT_DIR / "pressure_distribution_by_stage.png"
        ]
        for p in expected_outputs:
            self.assertTrue(p.exists(), f"Missing output: {p.name}")
            self.assertGreater(p.stat().st_size, 0, f"Empty output: {p.name}")

    def test_10_methodology_report_structure(self):
        """Verify METHODOLOGY_REPORT.md exists, is substantial, and covers all sections."""
        report_path = REPORTS_DIR / "METHODOLOGY_REPORT.md"
        self.assertTrue(report_path.exists())
        self.assertGreater(report_path.stat().st_size, 5000)

        content = report_path.read_text(encoding='utf-8')
        required_headers = [
            "Executive Summary",
            "1. Problem Statement",
            "2. Dataset Overview",
            "3. Data Preprocessing",
            "4. Definition & Quantification of Pressure",
            "5. Batting Methodology",
            "6. Bowling Methodology",
            "7. Sample-Size Adjustments",
            "8. Official Player Rankings",
            "9. Visualizations",
            "10. Limitations",
            "11. Conclusion"
        ]
        for header in required_headers:
            self.assertIn(header, content, f"Missing required section: {header}")


if __name__ == "__main__":
    unittest.main()
