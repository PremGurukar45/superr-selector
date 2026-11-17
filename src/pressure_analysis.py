"""
pressure_analysis.py
Analyzes batting and bowling performances under pressure compared to normal baselines.
Computes key performance metrics, delta clutch scores, min-max standardizations,
and Bayesian shrinkage adjustments.
"""

from pathlib import Path
import numpy as np
import pandas as pd


def min_max_scale(series: pd.Series, invert: bool = False) -> pd.Series:
    """Scales a series to [0, 100]. Inverts if lower values are better (e.g. Economy, Dots for batters)."""
    mn, mx = series.min(), series.max()
    if mx == mn:
        return pd.Series(50.0, index=series.index)
    scaled = (series - mn) / (mx - mn) * 100.0
    return (100.0 - scaled) if invert else scaled


def analyze_batting_pressure(
    df: pd.DataFrame,
    min_balls_pressure: int = 150,
    min_matches_pressure: int = 10,
    k_shrinkage: float = 100.0
) -> pd.DataFrame:
    """
    Computes batting metrics under pressure vs baseline, calculates the Clutch Delta,
    and applies Bayesian sample-size shrinkage.
    """
    # 1. Overall Baseline Stats
    bat_overall = df.groupby('striker_id').agg(
        total_matches=('match_id', 'nunique'),
        total_balls_faced=('runs', 'count'),
        total_runs=('runs', 'sum'),
        total_dismissals=('is_wicket', 'sum')
    ).reset_index()
    bat_overall['baseline_sr'] = (bat_overall['total_runs'] / bat_overall['total_balls_faced']) * 100.0
    bat_overall['baseline_avg'] = bat_overall['total_runs'] / np.maximum(bat_overall['total_dismissals'], 1)

    # 2. Pressure Situations Stats
    df_p = df[df['is_high_pressure']]
    bat_p = df_p.groupby('striker_id').agg(
        striker_name=('striker_name', 'first'),
        pressure_matches=('match_id', 'nunique'),
        pressure_balls_faced=('runs', 'count'),
        pressure_runs=('runs', 'sum'),
        pressure_dismissals=('is_wicket', 'sum'),
        pressure_fours=('is_four', 'sum'),
        pressure_sixes=('is_six', 'sum'),
        pressure_dots=('is_batter_dot', 'sum')
    ).reset_index()

    merged = bat_p.merge(bat_overall, on='striker_id', how='inner')

    # Apply qualification criteria
    qualified = merged[
        (merged['pressure_balls_faced'] >= min_balls_pressure) &
        (merged['pressure_matches'] >= min_matches_pressure)
    ].copy()

    # Derived Pressure Metrics
    qualified['pressure_sr'] = (qualified['pressure_runs'] / qualified['pressure_balls_faced']) * 100.0
    qualified['pressure_avg'] = qualified['pressure_runs'] / np.maximum(qualified['pressure_dismissals'], 1)
    boundary_runs = qualified['pressure_fours'] * 4 + qualified['pressure_sixes'] * 6
    qualified['pressure_boundary_pct'] = (boundary_runs / np.maximum(qualified['pressure_runs'], 1)) * 100.0
    qualified['pressure_dot_pct'] = (qualified['pressure_dots'] / qualified['pressure_balls_faced']) * 100.0

    # Clutch Delta: Performance elevation under pressure compared to normal baseline
    qualified['delta_sr'] = qualified['pressure_sr'] - qualified['baseline_sr']

    # Standardized components (0 - 100)
    qualified['s_sr'] = min_max_scale(qualified['pressure_sr'])
    qualified['s_avg'] = min_max_scale(qualified['pressure_avg'])
    qualified['s_boundary'] = min_max_scale(qualified['pressure_boundary_pct'])
    qualified['s_nondot'] = min_max_scale(qualified['pressure_dot_pct'], invert=True)
    qualified['s_delta_sr'] = min_max_scale(qualified['delta_sr'])

    # Composite Raw Score
    # Weights justified by T20 cricket requirements:
    # 0.35 Strike Rate, 0.20 Dismissal Resistance, 0.15 Boundary Power, 0.10 Strike Rotation, 0.20 Clutch Delta
    qualified['raw_score'] = (
        0.35 * qualified['s_sr'] +
        0.20 * qualified['s_avg'] +
        0.15 * qualified['s_boundary'] +
        0.10 * qualified['s_nondot'] +
        0.20 * qualified['s_delta_sr']
    )

    # Bayesian Shrinkage towards population mean to reward larger sample sizes
    confidence = qualified['pressure_balls_faced'] / (qualified['pressure_balls_faced'] + k_shrinkage)
    pop_mean = qualified['raw_score'].mean()
    qualified['pressure_score'] = confidence * qualified['raw_score'] + (1.0 - confidence) * pop_mean
    qualified['pressure_score'] = qualified['pressure_score'].round(2)

    return qualified.sort_values('pressure_score', ascending=False).reset_index(drop=True)


def analyze_bowling_pressure(
    df: pd.DataFrame,
    min_balls_pressure: int = 150,
    min_matches_pressure: int = 10,
    k_shrinkage: float = 100.0
) -> pd.DataFrame:
    """
    Computes bowling metrics under pressure vs baseline, calculates the Clutch Economy Delta,
    and applies Bayesian sample-size shrinkage.
    """
    # 1. Overall Baseline Stats
    bowl_overall = df.groupby('bowler_id').agg(
        total_matches=('match_id', 'nunique'),
        total_legal_balls=('is_legal_int', 'sum'),
        total_runs_conceded=('bowler_runs_conceded', 'sum'),
        total_wickets=('is_bowler_wicket', 'sum')
    ).reset_index()
    bowl_overall['baseline_econ'] = (bowl_overall['total_runs_conceded'] / bowl_overall['total_legal_balls']) * 6.0

    # 2. Pressure Situations Stats
    df_p = df[df['is_high_pressure']]
    bowl_p = df_p.groupby('bowler_id').agg(
        bowler_name=('bowler_name', 'first'),
        pressure_matches=('match_id', 'nunique'),
        pressure_legal_balls=('is_legal_int', 'sum'),
        pressure_runs_conceded=('bowler_runs_conceded', 'sum'),
        pressure_wickets=('is_bowler_wicket', 'sum'),
        pressure_dots=('is_bowler_dot', 'sum'),
        pressure_fours=('is_four', 'sum'),
        pressure_sixes=('is_six', 'sum')
    ).reset_index()

    merged = bowl_p.merge(bowl_overall, on='bowler_id', how='inner')

    # Apply qualification criteria
    qualified = merged[
        (merged['pressure_legal_balls'] >= min_balls_pressure) &
        (merged['pressure_matches'] >= min_matches_pressure)
    ].copy()

    # Derived Pressure Metrics
    qualified['pressure_econ'] = (qualified['pressure_runs_conceded'] / qualified['pressure_legal_balls']) * 6.0
    qualified['pressure_wkt_rate'] = (qualified['pressure_wickets'] / qualified['pressure_legal_balls']) * 100.0
    qualified['pressure_dot_pct'] = (qualified['pressure_dots'] / qualified['pressure_legal_balls']) * 100.0
    conceded_boundaries = qualified['pressure_fours'] + qualified['pressure_sixes']
    qualified['pressure_boundary_pct'] = (conceded_boundaries / qualified['pressure_legal_balls']) * 100.0

    # Clutch Delta: Economy improvement under pressure (positive = tighter under pressure)
    qualified['delta_econ'] = qualified['baseline_econ'] - qualified['pressure_econ']

    # Standardized components (0 - 100)
    qualified['s_econ'] = min_max_scale(qualified['pressure_econ'], invert=True)
    qualified['s_wkt'] = min_max_scale(qualified['pressure_wkt_rate'])
    qualified['s_dot'] = min_max_scale(qualified['pressure_dot_pct'])
    qualified['s_low_bnd'] = min_max_scale(qualified['pressure_boundary_pct'], invert=True)
    qualified['s_delta_econ'] = min_max_scale(qualified['delta_econ'])

    # Composite Raw Score
    # Weights justified by T20 cricket requirements:
    # 0.35 Economy Suppression, 0.25 Wicket Taking, 0.15 Dot Ball Generation, 0.10 Boundary Containment, 0.15 Clutch Delta
    qualified['raw_score'] = (
        0.35 * qualified['s_econ'] +
        0.25 * qualified['s_wkt'] +
        0.15 * qualified['s_dot'] +
        0.10 * qualified['s_low_bnd'] +
        0.15 * qualified['s_delta_econ']
    )

    # Bayesian Shrinkage towards population mean
    confidence = qualified['pressure_legal_balls'] / (qualified['pressure_legal_balls'] + k_shrinkage)
    pop_mean = qualified['raw_score'].mean()
    qualified['pressure_score'] = confidence * qualified['raw_score'] + (1.0 - confidence) * pop_mean
    qualified['pressure_score'] = qualified['pressure_score'].round(2)

    return qualified.sort_values('pressure_score', ascending=False).reset_index(drop=True)
