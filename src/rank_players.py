"""
rank_players.py
Produces the official Top 10 Batters and Top 10 Bowlers rankings under pressure.
Generates comprehensive analytical rationales for each ranked player,
exports final CSV files to output/, and provides human-readable summary tables.
"""

from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def generate_batter_explanation(row: pd.Series) -> str:
    """Generates an insightful, data-driven analytical rationale for a batter's ranking."""
    name = row['striker_name']
    sr = row['pressure_sr']
    delta = row['delta_sr']
    avg = row['pressure_avg']
    balls = row['pressure_balls_faced']
    runs = row['pressure_runs']
    bp = row['pressure_boundary_pct']

    if delta > 25.0:
        clutch_text = f"demonstrating extraordinary clutch elevation (+{delta:.1f} SR above baseline)"
    elif delta > 15.0:
        clutch_text = f"elevating his scoring rate significantly (+{delta:.1f} SR above baseline)"
    elif delta > 5.0:
        clutch_text = f"consistently outpacing his baseline scoring (+{delta:.1f} SR)"
    else:
        clutch_text = f"sustaining elite scoring under extreme defensive fields (SR {sr:.1f})"

    return (
        f"{name} scored {runs:,} runs in {balls:,} pressure balls (SR {sr:.1f}, Avg {avg:.1f}), "
        f"{clutch_text} with {bp:.1f}% boundary percentage."
    )


def generate_bowler_explanation(row: pd.Series) -> str:
    """Generates an insightful, data-driven analytical rationale for a bowler's ranking."""
    name = row['bowler_name']
    econ = row['pressure_econ']
    wkts = row['pressure_wickets']
    balls = row['pressure_legal_balls']
    dots = row['pressure_dot_pct']
    delta = row['delta_econ']

    if econ < 6.5:
        econ_text = f"smothering the opposition with an incredible {econ:.2f} pressure economy"
    elif econ < 7.5:
        econ_text = f"maintaining exceptional control with a {econ:.2f} pressure economy"
    else:
        econ_text = f"delivering high-leverage defensive control ({econ:.2f} economy)"

    if delta > 0.5:
        delta_text = f"bowling tighter under pressure than normal (+{delta:.2f} economy improvement)"
    else:
        delta_text = f"striking reliably under pressure ({wkts} wickets, {dots:.1f}% dot-balls)"

    return (
        f"{name} delivered {balls:,} pressure balls taking {wkts} wickets, "
        f"{econ_text} and {delta_text} across {row['pressure_matches']} matches."
    )


def build_and_export_rankings(batters_df: pd.DataFrame, bowlers_df: pd.DataFrame):
    """Formats, annotates with explanations, and exports rankings to CSV."""
    # 1. Batters
    top10_bat = batters_df.head(10).copy()
    top10_bat['rank'] = range(1, 11)
    top10_bat['explanation'] = top10_bat.apply(generate_batter_explanation, axis=1)

    bat_cols = [
        'rank', 'striker_id', 'striker_name', 'pressure_matches',
        'pressure_balls_faced', 'pressure_runs', 'pressure_dismissals',
        'pressure_sr', 'pressure_avg', 'pressure_boundary_pct', 'pressure_dot_pct',
        'baseline_sr', 'delta_sr', 'pressure_score', 'explanation'
    ]
    top10_bat_formatted = top10_bat[bat_cols].rename(columns={
        'striker_id': 'player_id',
        'striker_name': 'player_name',
        'pressure_matches': 'matches',
        'pressure_balls_faced': 'balls_faced',
        'pressure_runs': 'runs_scored',
        'pressure_dismissals': 'dismissals',
        'pressure_sr': 'strike_rate',
        'pressure_avg': 'average',
        'pressure_boundary_pct': 'boundary_percent',
        'pressure_dot_pct': 'dot_percent'
    })

    # Round floats
    round_cols_bat = ['strike_rate', 'average', 'boundary_percent', 'dot_percent', 'baseline_sr', 'delta_sr', 'pressure_score']
    top10_bat_formatted[round_cols_bat] = top10_bat_formatted[round_cols_bat].round(2)

    top10_bat_path = OUTPUT_DIR / "top_10_batters_under_pressure.csv"
    top10_bat_formatted.to_csv(top10_bat_path, index=False)

    # 2. Bowlers
    top10_bowl = bowlers_df.head(10).copy()
    top10_bowl['rank'] = range(1, 11)
    top10_bowl['explanation'] = top10_bowl.apply(generate_bowler_explanation, axis=1)

    bowl_cols = [
        'rank', 'bowler_id', 'bowler_name', 'pressure_matches',
        'pressure_legal_balls', 'pressure_runs_conceded', 'pressure_wickets',
        'pressure_econ', 'pressure_wkt_rate', 'pressure_dot_pct', 'pressure_boundary_pct',
        'baseline_econ', 'delta_econ', 'pressure_score', 'explanation'
    ]
    top10_bowl_formatted = top10_bowl[bowl_cols].rename(columns={
        'bowler_id': 'player_id',
        'bowler_name': 'player_name',
        'pressure_matches': 'matches',
        'pressure_legal_balls': 'legal_balls',
        'pressure_runs_conceded': 'runs_conceded',
        'pressure_wickets': 'wickets',
        'pressure_econ': 'economy_rate',
        'pressure_wkt_rate': 'wicket_rate',
        'pressure_dot_pct': 'dot_percent',
        'pressure_boundary_pct': 'boundary_conceded_percent'
    })

    round_cols_bowl = ['economy_rate', 'wicket_rate', 'dot_percent', 'boundary_conceded_percent', 'baseline_econ', 'delta_econ', 'pressure_score']
    top10_bowl_formatted[round_cols_bowl] = top10_bowl_formatted[round_cols_bowl].round(2)

    top10_bowl_path = OUTPUT_DIR / "top_10_bowlers_under_pressure.csv"
    top10_bowl_formatted.to_csv(top10_bowl_path, index=False)

    # Also export all qualified players for complete transparency
    batters_df.round(2).to_csv(OUTPUT_DIR / "all_qualified_batters_pressure_metrics.csv", index=False)
    bowlers_df.round(2).to_csv(OUTPUT_DIR / "all_qualified_bowlers_pressure_metrics.csv", index=False)

    return top10_bat_formatted, top10_bowl_formatted


if __name__ == "__main__":
    from preprocess import load_raw_data, clean_and_enrich_deliveries
    from pressure_analysis import analyze_batting_pressure, analyze_bowling_pressure

    comps, teams, matches, p11, mapping, bbb = load_raw_data()
    df, _ = clean_and_enrich_deliveries(matches, bbb, mapping)
    batters = analyze_batting_pressure(df)
    bowlers = analyze_bowling_pressure(df)
    t10_bat, t10_bowl = build_and_export_rankings(batters, bowlers)

    print("=== TOP 10 BATTERS UNDER PRESSURE ===")
    print(t10_bat[['rank', 'player_name', 'balls_faced', 'runs_scored', 'strike_rate', 'average', 'delta_sr', 'pressure_score']].to_string(index=False))

    print("\n=== TOP 10 BOWLERS UNDER PRESSURE ===")
    print(t10_bowl[['rank', 'player_name', 'legal_balls', 'runs_conceded', 'wickets', 'economy_rate', 'dot_percent', 'pressure_score']].to_string(index=False))
