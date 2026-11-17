"""
inspect_data.py
Inspects all six core dataset CSV files for SupeRR Selector Season 2.
Performs data type checks, missing value profiling, duplicate detection,
and key domain validations.
"""

import sys
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
REPORTS_DIR = PROJECT_ROOT / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

CSV_FILES = [
    "competitions.csv",
    "teams.csv",
    "matches.csv",
    "playing_eleven.csv",
    "competition_team_player_mapping.csv",
    "ball_by_ball.csv"
]


def inspect_dataset():
    report_lines = []
    
    def log(msg=""):
        print(msg)
        report_lines.append(str(msg))

    log("=" * 70)
    log("SUPERR SELECTOR SEASON 2 — COMPREHENSIVE DATA INSPECTION")
    log("=" * 70)

    for filename in CSV_FILES:
        filepath = DATA_DIR / filename
        log("\n" + "-" * 70)
        log(f"FILE: {filename}")
        log("-" * 70)

        if not filepath.exists():
            log(f"ERROR: File {filename} not found at {filepath}!")
            continue

        df = pd.read_csv(filepath, low_memory=False)
        log(f"Shape: {df.shape[0]:,} rows x {df.shape[1]} columns")
        log(f"Memory Usage: {df.memory_usage(deep=True).sum() / (1024**2):.2f} MB")
        
        # Duplicate detection
        dup_count = df.duplicated().sum()
        log(f"Exact Duplicate Rows: {dup_count}")

        # Missing values
        log("\nColumns, Data Types, and Missing Values:")
        missing_df = pd.DataFrame({
            'Data Type': df.dtypes,
            'Missing Count': df.isnull().sum(),
            'Missing Pct': (df.isnull().sum() / len(df) * 100).round(2)
        })
        log(missing_df.to_string())

        # Specific file highlights
        if filename == "competitions.csv":
            log("\nCompetition Formats:")
            log(df['match_format'].value_counts().to_string())
            log("\nSeasons Covered:")
            log(df['season'].value_counts().sort_index().to_string())

        elif filename == "matches.csv":
            log("\nMatch Stages:")
            log(df['stage'].value_counts().to_string())
            log(f"Knockout Matches: {(df['knock_out'] == 1).sum()} / {len(df)}")
            log(f"Matches with Revised Target: {df['revised_target'].notnull().sum()}")
            log(f"Unique Matches: {df['match_id'].nunique()}")

        elif filename == "ball_by_ball.csv":
            log("\nInnings Distribution:")
            log(df['innings'].value_counts().to_string())
            log("\nExtras Types:")
            log(df['extras_type'].value_counts(dropna=False).to_string())
            log("\nDismissal Types:")
            log(df['dismissal_type'].value_counts(dropna=False).to_string())
            log(f"Total Wickets: {df['is_wicket'].sum():,}")
            log(f"Unique Matches in BBB: {df['match_id'].nunique()}")
            log(f"Unique Strikers: {df['striker_id'].nunique()}")
            log(f"Unique Bowlers: {df['bowler_id'].nunique()}")

        elif filename == "competition_team_player_mapping.csv":
            log(f"Unique Players: {df['player_id'].nunique()}")
            log(f"Unique Teams: {df['team_id'].nunique()}")
            log(f"Unique Competitions: {df['comp_id'].nunique()}")

        log("\nFirst 3 Rows:")
        log(df.head(3).to_string())

    report_path = REPORTS_DIR / "data_inspection.txt"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
    log(f"\nInspection report saved successfully to: {report_path}")


if __name__ == "__main__":
    inspect_dataset()
