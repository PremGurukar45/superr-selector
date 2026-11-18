"""
export_web_data.py
Bridges the verified Python analytics outputs to structured JSON for the React web platform.
Extracts player teams, KPI summaries, full qualified lists, and official rankings.
"""

import json
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_DIR = PROJECT_ROOT / "output"
FRONTEND_DATA_DIR = PROJECT_ROOT / "frontend" / "src" / "data"
FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)


def get_primary_team_map():
    """Builds a map from player_id to their primary team (preferring IPL team if available)."""
    mapping = pd.read_csv(DATA_DIR / "competition_team_player_mapping.csv")
    team_map = {}
    
    for pid, group in mapping.groupby('player_id'):
        ipl_rows = group[group['comp_name'].str.contains('IPL', case=False, na=False)]
        if len(ipl_rows) > 0:
            team_map[pid] = ipl_rows['team_name'].iloc[-1]
        else:
            team_map[pid] = group['team_name'].iloc[-1]
            
    # IPL 2027 Verified Trade & Roster Updates:
    # Mohammed Shami traded to Rajasthan Royals for IPL 2027
    shami_rows = mapping[mapping['player_name'] == 'Mohammed Shami']
    if not shami_rows.empty:
        shami_id = shami_rows['player_id'].iloc[0]
        team_map[shami_id] = 'Rajasthan Royals'

    return team_map


def main():
    print("Exporting verified analytics data for web frontend...")
    team_map = get_primary_team_map()

    # 1. Top 10 Batters
    t10_bat = pd.read_csv(OUTPUT_DIR / "top_10_batters_under_pressure.csv")
    t10_bat['team'] = t10_bat['player_id'].map(team_map).fillna('International / Domestic')

    # 2. Top 10 Bowlers
    t10_bowl = pd.read_csv(OUTPUT_DIR / "top_10_bowlers_under_pressure.csv")
    t10_bowl['team'] = t10_bowl['player_id'].map(team_map).fillna('International / Domestic')

    # 3. All Qualified Batters
    all_bat = pd.read_csv(OUTPUT_DIR / "all_qualified_batters_pressure_metrics.csv")
    all_bat['team'] = all_bat['striker_id'].map(team_map).fillna('International / Domestic')
    all_bat['rank'] = range(1, len(all_bat) + 1)

    # 4. All Qualified Bowlers
    all_bowl = pd.read_csv(OUTPUT_DIR / "all_qualified_bowlers_pressure_metrics.csv")
    all_bowl['team'] = all_bowl['bowler_id'].map(team_map).fillna('International / Domestic')
    all_bowl['rank'] = range(1, len(all_bowl) + 1)

    # 5. Global KPIs
    matches = pd.read_csv(DATA_DIR / "matches.csv")
    bbb = pd.read_csv(DATA_DIR / "ball_by_ball.csv")
    competitions = pd.read_csv(DATA_DIR / "competitions.csv")

    kpis = {
        "total_matches": int(len(matches)),
        "matches_played": int(bbb['match_id'].nunique()),
        "total_deliveries": int(len(bbb)),
        "total_players": int(bbb['striker_id'].nunique() + bbb['bowler_id'].nunique()),
        "qualified_batters": int(len(all_bat)),
        "qualified_bowlers": int(len(all_bowl)),
        "high_pressure_pct": 40.8,
        "inn1_hp_pct": 32.5,
        "inn2_hp_pct": 50.1,
        "inn2_death_hp_pct": 81.9,
        "seasons": sorted(competitions['season'].astype(str).unique().tolist())
    }

    # Consolidated JSON payload
    payload = {
        "kpis": kpis,
        "top_10_batters": t10_bat.to_dict(orient="records"),
        "top_10_bowlers": t10_bowl.to_dict(orient="records"),
        "all_batters": all_bat.to_dict(orient="records"),
        "all_bowlers": all_bowl.to_dict(orient="records")
    }

    output_file = FRONTEND_DATA_DIR / "platform_data.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"Data exported successfully to: {output_file}")
    print(f"Payload summary: {len(payload['top_10_batters'])} Top Batters, {len(payload['top_10_bowlers'])} Top Bowlers, {len(payload['all_batters'])} All Batters, {len(payload['all_bowlers'])} All Bowlers.")


if __name__ == "__main__":
    main()
