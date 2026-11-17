"""
preprocess.py
End-to-end data preprocessing pipeline for SupeRR Selector Season 2.
Loads all raw CSV files, enforces domain integrity (legal deliveries, bowler runs,
wicket attribution, match targets, cumulative ball-by-ball match state),
and calculates delivery-level continuous Pressure Index and discrete pressure categories.
"""

from pathlib import Path
import warnings
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore", category=UserWarning)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"


def load_raw_data(data_dir: Path = DATA_DIR):
    """Loads all six dataset CSV files."""
    competitions = pd.read_csv(data_dir / "competitions.csv", low_memory=False)
    teams = pd.read_csv(data_dir / "teams.csv", low_memory=False)
    matches = pd.read_csv(data_dir / "matches.csv", low_memory=False)
    playing_eleven = pd.read_csv(data_dir / "playing_eleven.csv", low_memory=False)
    mapping = pd.read_csv(data_dir / "competition_team_player_mapping.csv", low_memory=False)
    ball_by_ball = pd.read_csv(data_dir / "ball_by_ball.csv", low_memory=False)
    return competitions, teams, matches, playing_eleven, mapping, ball_by_ball


def compute_targets_and_match_context(matches: pd.DataFrame, bbb: pd.DataFrame):
    """
    Computes 1st innings total runs, determines official target for 2nd innings
    (using revised_target where DLS/rain applied, or inn1_total + 1), and scheduled overs.
    """
    # Total runs off each delivery
    bbb['ball_total_runs'] = bbb['runs'] + bbb['extras1_runs'] + bbb['extras_2_runs']

    # Innings 1 totals per match
    inn1 = bbb[bbb['innings'] == 1].groupby('match_id')['ball_total_runs'].sum().reset_index()
    inn1.columns = ['match_id', 'inn1_total_runs']

    matches_ctx = matches.copy()
    matches_ctx = matches_ctx.merge(inn1, on='match_id', how='left')

    # Effective target: revised_target takes precedence if available; else inn1_total_runs + 1
    matches_ctx['target'] = matches_ctx['revised_target'].combine_first(matches_ctx['inn1_total_runs'] + 1)

    # Effective scheduled overs per innings
    matches_ctx['first_inn_scheduled_overs'] = matches_ctx['first_inn_revised_overs'].fillna(20.0)
    matches_ctx['second_inn_scheduled_overs'] = matches_ctx['second_inn_revised_overs'].fillna(20.0)

    # Knockout flag: stage matches knockout or knockout column == 1
    ko_stages = ['Final', 'Qualifier', 'Eliminator', 'Semi Final', 'Super 4']
    matches_ctx['is_knockout_stage'] = (matches_ctx['knock_out'] == 1) | (matches_ctx['stage'].isin(ko_stages))

    return matches_ctx


def clean_and_enrich_deliveries(matches: pd.DataFrame, bbb: pd.DataFrame, mapping: pd.DataFrame):
    """
    Cleans deliveries, tracks cumulative match state, and computes Pressure Index.
    """
    matches_ctx = compute_targets_and_match_context(matches, bbb)

    df = bbb.copy()

    # 1. Delivery Legality
    # In cricket, wide, Overstep (front-foot no-ball), and other (height no-ball) are illegal
    df['is_illegal'] = df['extras_type'].isin(['wide', 'Overstep', 'other'])
    df['is_legal'] = ~df['is_illegal']
    df['is_legal_int'] = df['is_legal'].astype(int)
    df['is_wicket_int'] = df['is_wicket'].astype(int)

    # 2. Bowler Wickets and Runs Conceded
    bowler_dismissals = ['Caught', 'Bowled', 'LBW', 'Stump', 'Hit Wicket']
    df['is_bowler_wicket'] = df['is_wicket'] & df['dismissal_type'].isin(bowler_dismissals)
    
    # Bowler extras: wides and noballs charged to bowler; byes/legbyes/penalty are not
    bowler_extra_mask = df['extras_type'].isin(['wide', 'Overstep', 'other'])
    df['bowler_extra_runs'] = np.where(bowler_extra_mask, df['extras1_runs'] + df['extras_2_runs'], 0)
    df['bowler_runs_conceded'] = df['runs'] + df['bowler_extra_runs']

    # Dot balls:
    # Bowler dot: 0 runs conceded on delivery
    df['is_bowler_dot'] = (df['bowler_runs_conceded'] == 0)
    # Batter dot: batter faced delivery and scored 0 runs off bat (excluding wides where batter didn't play ball)
    df['is_batter_dot'] = (df['runs'] == 0) & (df['extras_type'] != 'wide')

    # 3. Merge match context
    cols_to_merge = [
        'match_id', 'comp_id', 'stage', 'knock_out', 'is_knockout_stage',
        'target', 'first_inn_scheduled_overs', 'second_inn_scheduled_overs'
    ]
    df = df.merge(matches_ctx[cols_to_merge], on='match_id', how='left')

    # 4. Sort chronologically
    df = df.sort_values(['match_id', 'innings', 'innings_ball_num']).reset_index(drop=True)

    # 5. Incremental Cumulative State (within match and innings)
    g = df.groupby(['match_id', 'innings'])
    df['cum_runs'] = g['ball_total_runs'].cumsum()
    df['cum_wickets'] = g['is_wicket_int'].cumsum()
    df['cum_legal_balls'] = g['is_legal_int'].cumsum()

    # Prior state (before current delivery is bowled)
    df['runs_before'] = df['cum_runs'] - df['ball_total_runs']
    df['wickets_before'] = df['cum_wickets'] - df['is_wicket_int']
    df['legal_balls_before'] = df['cum_legal_balls'] - df['is_legal_int']

    # Scheduled balls
    df['scheduled_balls'] = np.where(
        df['innings'] == 1,
        df['first_inn_scheduled_overs'] * 6,
        df['second_inn_scheduled_overs'] * 6
    )
    df['balls_remaining'] = np.maximum(0, df['scheduled_balls'] - df['legal_balls_before'])
    df['wickets_in_hand'] = np.maximum(0, 10 - df['wickets_before'])
    df['runs_needed'] = np.maximum(0, df['target'] - df['runs_before'])

    # Rates
    df['rrr'] = np.where(df['balls_remaining'] > 0, (df['runs_needed'] / df['balls_remaining']) * 6, 36.0)
    df['crr'] = np.where(df['legal_balls_before'] > 0, (df['runs_before'] / df['legal_balls_before']) * 6, 0.0)

    # Match Stage
    # Powerplay: 1-6, Middle: 7-15, Death: 16-20
    df['match_stage'] = 'Middle'
    df.loc[df['overid'] <= 6, 'match_stage'] = 'Powerplay'
    df.loc[df['overid'] >= 16, 'match_stage'] = 'Death'

    # 6. Pressure Quantification Model
    # A continuous Pressure Index (PI) between 0.0 and 1.0
    pi = np.zeros(len(df), dtype=float)

    # --- INNINGS 3 & 4 (Super Overs) ---
    is_so = df['innings'] >= 3
    pi[is_so] = 1.0

    # --- INNINGS 1 (Setting Target: No RRR applied) ---
    is_inn1 = df['innings'] == 1
    
    # 1. Death overs (Overs 16-20)
    inn1_death = is_inn1 & (df['overid'] >= 16)
    death_component = 0.60 + 0.05 * (df['overid'] - 16) + 0.025 * np.clip(10 - df['wickets_in_hand'], 0, 8)
    pi[inn1_death] = np.clip(death_component[inn1_death], 0.60, 0.95)

    # 2. Crisis / Collapse situations:
    # Powerplay crisis: >= 3 wickets down in first 6 overs
    inn1_pp_crisis = is_inn1 & (df['overid'] <= 6) & (df['wickets_before'] >= 3)
    pi[inn1_pp_crisis] = np.maximum(pi[inn1_pp_crisis], 0.65 + 0.07 * (df['wickets_before'][inn1_pp_crisis] - 3))

    # Middle crisis: >= 4 wickets down by over 12
    inn1_mid_crisis = is_inn1 & (df['overid'] >= 7) & (df['overid'] <= 12) & (df['wickets_before'] >= 4)
    pi[inn1_mid_crisis] = np.maximum(pi[inn1_mid_crisis], 0.62 + 0.06 * (df['wickets_before'][inn1_mid_crisis] - 4))

    # Routine Innings 1 base pressure: 0.20 to 0.50
    inn1_routine = is_inn1 & (~inn1_death) & (~inn1_pp_crisis) & (~inn1_mid_crisis)
    pi[inn1_routine] = np.clip(0.20 + 0.015 * df['overid'][inn1_routine] + 0.02 * df['wickets_before'][inn1_routine], 0.15, 0.50)

    # --- INNINGS 2 (Chasing Target) ---
    is_inn2 = df['innings'] == 2

    # Check for match conclusion / garbage time
    # Already won: <= 5 runs needed with >= 6 wickets in hand and >= 20 balls left
    is_chase_won = is_inn2 & (df['runs_needed'] <= 5) & (df['wickets_in_hand'] >= 6) & (df['balls_remaining'] >= 20)
    # Effectively lost: RRR > 24 with <= 2 wickets in hand and > 12 balls left
    is_chase_lost = is_inn2 & (df['rrr'] > 24.0) & (df['wickets_in_hand'] <= 2) & (df['balls_remaining'] > 12)

    # Active chase calculation
    # Death overs close finish: overid >= 16 and rrr between 6.0 and 22.0
    inn2_death = is_inn2 & (df['overid'] >= 16) & (df['rrr'] >= 6.0) & (df['rrr'] <= 22.0) & (df['wickets_in_hand'] >= 1)
    # Steep RRR in middle or powerplay: rrr >= 10.0 and rrr <= 22.0
    inn2_steep = is_inn2 & (df['rrr'] >= 10.0) & (df['rrr'] <= 22.0) & (df['wickets_in_hand'] >= 2)
    # Collapse in chase: PP wickets >= 3, or middle wickets >= 5 with rrr >= 8.5
    inn2_crisis = is_inn2 & (
        ((df['overid'] <= 6) & (df['wickets_before'] >= 3)) |
        ((df['overid'] <= 14) & (df['wickets_before'] >= 5) & (df['rrr'] >= 8.5))
    )

    # Continuous chase score:
    chase_rrr_factor = np.clip((df['rrr'] - 5.0) / 12.0, 0.0, 1.0)
    stage_factor = np.clip((df['overid'] - 1) / 19.0, 0.0, 1.0)
    wkt_factor = (10 - df['wickets_in_hand']) / 10.0

    active_score = 0.25 + 0.45 * chase_rrr_factor + 0.15 * stage_factor + 0.15 * wkt_factor
    active_score = np.where(inn2_crisis, np.maximum(active_score, 0.65), active_score)
    active_score = np.where(inn2_death, np.maximum(active_score, 0.62), active_score)
    active_score = np.where(inn2_steep, np.maximum(active_score, 0.60), active_score)

    is_active = is_inn2 & (~is_chase_won) & (~is_chase_lost)
    pi[is_active] = np.clip(active_score[is_active], 0.20, 0.98)
    pi[is_chase_won] = 0.10
    pi[is_chase_lost] = 0.20

    # Knockout stage multiplier
    ko_boost = np.where(df['is_knockout_stage'], 0.08, 0.0)
    pi = np.clip(pi + ko_boost, 0.0, 1.0)

    df['pressure_index'] = np.round(pi, 4)

    # Discrete classification:
    # High: PI >= 0.60, Medium: 0.35 <= PI < 0.60, Low: PI < 0.35
    df['is_high_pressure'] = df['pressure_index'] >= 0.60
    df['pressure_level'] = 'Low'
    df.loc[df['pressure_index'] >= 0.35, 'pressure_level'] = 'Medium'
    df.loc[df['pressure_index'] >= 0.60, 'pressure_level'] = 'High'

    return df, matches_ctx


if __name__ == "__main__":
    print("Testing data preprocessing pipeline...")
    comps, teams, matches, p11, mapping, bbb = load_raw_data()
    enriched_df, matches_ctx = clean_and_enrich_deliveries(matches, bbb, mapping)
    print(f"Preprocessed {len(enriched_df):,} deliveries successfully!")
    print("\nPressure Level Breakdown:")
    print(enriched_df['pressure_level'].value_counts(normalize=True).round(3) * 100)
    print("\nHigh Pressure by Innings:")
    print(enriched_df.groupby('innings')['is_high_pressure'].mean().round(3) * 100)
