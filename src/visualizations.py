"""
visualizations.py
Generates publication-quality, professional data visualizations for SupeRR Selector Season 2.
Produces:
1. batters_top10_comparison.png: Multi-metric breakdown of the Top 10 Batters.
2. bowlers_top10_comparison.png: Multi-metric breakdown of the Top 10 Bowlers.
3. batting_pressure_vs_baseline.png: Clutch elevation scatter plot for all qualified batters.
4. bowling_pressure_vs_baseline.png: Economy suppression scatter plot for all qualified bowlers.
5. pressure_distribution_by_stage.png: Match context and pressure index distribution.
"""

from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Styling setup
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Helvetica, Arial, DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#cccccc'
plt.rcParams['axes.linewidth'] = 0.8


def plot_top10_batters(top10_bat: pd.DataFrame, output_path: Path = OUTPUT_DIR / "batters_top10_comparison.png"):
    """Creates a 2x2 dashboard for the Top 10 Batters under pressure."""
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle("SupeRR Selector Season 2 — Top 10 Batters Under Pressure", fontsize=18, fontweight='bold', y=0.98)

    df = top10_bat.sort_values('rank', ascending=False)  # For horizontal bars from rank 1 at top

    # 1. Pressure Score
    ax1 = axes[0, 0]
    bars1 = ax1.barh(df['player_name'], df['pressure_score'], color='#1f77b4', edgecolor='none', height=0.65)
    ax1.set_title("Overall Pressure Performance Score (0-100)", fontsize=13, fontweight='bold', pad=10)
    ax1.set_xlabel("Pressure Score")
    ax1.set_xlim(60, 85)
    for bar in bars1:
        width = bar.get_width()
        ax1.text(width + 0.3, bar.get_y() + bar.get_height() / 2, f"{width:.1f}", va='center', fontsize=10, fontweight='bold', color='#333333')

    # 2. Strike Rate Comparison (Pressure vs Baseline)
    ax2 = axes[0, 1]
    y_pos = np.arange(len(df))
    height = 0.35
    ax2.barh(y_pos + height/2, df['strike_rate'], height, label='Pressure SR', color='#e28743', edgecolor='none')
    ax2.barh(y_pos - height/2, df['baseline_sr'], height, label='Baseline SR', color='#adb5bd', edgecolor='none')
    ax2.set_yticks(y_pos)
    ax2.set_yticklabels(df['player_name'])
    ax2.set_title("Pressure Strike Rate vs Usual Baseline", fontsize=13, fontweight='bold', pad=10)
    ax2.set_xlabel("Strike Rate (Runs / 100 Balls)")
    ax2.legend(loc='lower right', frameon=True)
    ax2.set_xlim(120, 205)

    # 3. Runs and Average
    ax3 = axes[1, 0]
    scatter = ax3.scatter(df['average'], df['strike_rate'], s=df['balls_faced'] * 0.8, c=df['pressure_score'], cmap='viridis', edgecolors='black', linewidth=1.2, alpha=0.9)
    ax3.set_title("Batting Average vs Strike Rate Under Pressure\n(Bubble size = Balls Faced under pressure)", fontsize=13, fontweight='bold', pad=10)
    ax3.set_xlabel("Pressure Batting Average (Runs / Dismissal)")
    ax3.set_ylabel("Pressure Strike Rate")
    for _, row in df.iterrows():
        ax3.annotate(row['player_name'], (row['average'] + 0.5, row['strike_rate'] + 0.5), fontsize=9, fontweight='semibold')
    cbar = fig.colorbar(scatter, ax=ax3)
    cbar.set_label('Pressure Score', rotation=270, labelpad=15)

    # 4. Boundary % vs Dot %
    ax4 = axes[1, 1]
    ax4.barh(y_pos + height/2, df['boundary_percent'], height, label='Boundary %', color='#2ca02c', edgecolor='none')
    ax4.barh(y_pos - height/2, df['dot_percent'], height, label='Dot Ball %', color='#d62728', edgecolor='none')
    ax4.set_yticks(y_pos)
    ax4.set_yticklabels(df['player_name'])
    ax4.set_title("Boundary Contribution % vs Dot Ball % Under Pressure", fontsize=13, fontweight='bold', pad=10)
    ax4.set_xlabel("Percentage (%)")
    ax4.legend(loc='upper right', frameon=True)
    ax4.set_xlim(0, 90)

    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"Saved: {output_path}")


def plot_top10_bowlers(top10_bowl: pd.DataFrame, output_path: Path = OUTPUT_DIR / "bowlers_top10_comparison.png"):
    """Creates a 2x2 dashboard for the Top 10 Bowlers under pressure."""
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle("SupeRR Selector Season 2 — Top 10 Bowlers Under Pressure", fontsize=18, fontweight='bold', y=0.98)

    df = top10_bowl.sort_values('rank', ascending=False)

    # 1. Pressure Score
    ax1 = axes[0, 0]
    bars1 = ax1.barh(df['player_name'], df['pressure_score'], color='#2b5c8f', edgecolor='none', height=0.65)
    ax1.set_title("Overall Bowling Pressure Score (0-100)", fontsize=13, fontweight='bold', pad=10)
    ax1.set_xlabel("Pressure Score")
    ax1.set_xlim(50, 85)
    for bar in bars1:
        width = bar.get_width()
        ax1.text(width + 0.3, bar.get_y() + bar.get_height() / 2, f"{width:.1f}", va='center', fontsize=10, fontweight='bold', color='#333333')

    # 2. Economy Rate (Pressure vs Baseline)
    ax2 = axes[0, 1]
    y_pos = np.arange(len(df))
    height = 0.35
    ax2.barh(y_pos + height/2, df['economy_rate'], height, label='Pressure Econ', color='#17becf', edgecolor='none')
    ax2.barh(y_pos - height/2, df['baseline_econ'], height, label='Baseline Econ', color='#adb5bd', edgecolor='none')
    ax2.set_yticks(y_pos)
    ax2.set_yticklabels(df['player_name'])
    ax2.set_title("Pressure Economy vs Usual Baseline Economy", fontsize=13, fontweight='bold', pad=10)
    ax2.set_xlabel("Economy Rate (Runs / Over)")
    ax2.legend(loc='lower right', frameon=True)
    ax2.set_xlim(4.0, 9.5)

    # 3. Wickets vs Economy
    ax3 = axes[1, 0]
    scatter = ax3.scatter(df['economy_rate'], df['wickets'], s=df['legal_balls'] * 0.7, c=df['pressure_score'], cmap='magma_r', edgecolors='black', linewidth=1.2, alpha=0.9)
    ax3.set_title("Economy Rate vs Wickets Under Pressure\n(Bubble size = Legal Balls Bowled)", fontsize=13, fontweight='bold', pad=10)
    ax3.set_xlabel("Pressure Economy Rate (Lower is Better)")
    ax3.set_ylabel("Pressure Wickets Taken")
    for _, row in df.iterrows():
        ax3.annotate(row['player_name'], (row['economy_rate'] + 0.05, row['wickets'] + 1), fontsize=9, fontweight='semibold')
    cbar = fig.colorbar(scatter, ax=ax3)
    cbar.set_label('Pressure Score', rotation=270, labelpad=15)

    # 4. Dot Ball % vs Boundary Conceded %
    ax4 = axes[1, 1]
    ax4.barh(y_pos + height/2, df['dot_percent'], height, label='Dot Ball % (Good)', color='#2ca02c', edgecolor='none')
    ax4.barh(y_pos - height/2, df['boundary_conceded_percent'], height, label='Boundary Conceded %', color='#d62728', edgecolor='none')
    ax4.set_yticks(y_pos)
    ax4.set_yticklabels(df['player_name'])
    ax4.set_title("Dot Ball % vs Boundary Concession % Under Pressure", fontsize=13, fontweight='bold', pad=10)
    ax4.set_xlabel("Percentage (%)")
    ax4.legend(loc='lower right', frameon=True)
    ax4.set_xlim(0, 65)

    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"Saved: {output_path}")


def plot_batting_pressure_vs_baseline(
    all_batters: pd.DataFrame,
    top10_bat: pd.DataFrame,
    output_path: Path = OUTPUT_DIR / "batting_pressure_vs_baseline.png"
):
    """Scatter plot showing clutch strike rate elevation for all qualified batters."""
    plt.figure(figsize=(12, 8))
    
    # Baseline line y = x
    min_val = min(all_batters['baseline_sr'].min(), all_batters['pressure_sr'].min()) - 10
    max_val = max(all_batters['baseline_sr'].max(), all_batters['pressure_sr'].max()) + 10
    plt.plot([min_val, max_val], [min_val, max_val], 'k--', alpha=0.5, label='Par Line (Pressure SR = Baseline SR)')
    plt.fill_between([min_val, max_val], [min_val, max_val], [max_val, max_val], color='#2ca02c', alpha=0.06, label='Clutch Elevation Zone (+Delta SR)')

    # Qualified non-top 10
    top10_ids = set(top10_bat['player_id'])
    non_top10 = all_batters[~all_batters['striker_id'].isin(top10_ids)]
    top10_rows = all_batters[all_batters['striker_id'].isin(top10_ids)]

    plt.scatter(
        non_top10['baseline_sr'], non_top10['pressure_sr'],
        s=non_top10['pressure_balls_faced'] * 0.4,
        c='#adb5bd', alpha=0.6, edgecolors='none', label='Other Qualified Batters'
    )

    # Top 10 highlighted
    scatter = plt.scatter(
        top10_rows['baseline_sr'], top10_rows['pressure_sr'],
        s=top10_rows['pressure_balls_faced'] * 0.7,
        c=top10_rows['pressure_score'], cmap='plasma', alpha=0.95,
        edgecolors='black', linewidth=1.5, label='Top 10 Ranked Batters'
    )

    for _, row in top10_rows.iterrows():
        plt.annotate(
            row['striker_name'],
            (row['baseline_sr'] + 0.8, row['pressure_sr'] + 0.8),
            fontsize=9.5, fontweight='bold', color='#111111'
        )

    plt.title("Batting Clutch Performance: Usual Baseline SR vs Pressure SR", fontsize=15, fontweight='bold', pad=15)
    plt.xlabel("Baseline Career Strike Rate (Normal Situations)", fontsize=12)
    plt.ylabel("Pressure Strike Rate (High-Pressure Situations)", fontsize=12)
    plt.xlim(min_val, max_val)
    plt.ylim(min_val, max_val)

    cbar = plt.colorbar(scatter)
    cbar.set_label('Pressure Score (0-100)', rotation=270, labelpad=15)
    plt.legend(loc='lower right', frameon=True, fontsize=10)

    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"Saved: {output_path}")


def plot_bowling_pressure_vs_baseline(
    all_bowlers: pd.DataFrame,
    top10_bowl: pd.DataFrame,
    output_path: Path = OUTPUT_DIR / "bowling_pressure_vs_baseline.png"
):
    """Scatter plot showing economy suppression under pressure for all qualified bowlers."""
    plt.figure(figsize=(12, 8))

    min_val = min(all_bowlers['baseline_econ'].min(), all_bowlers['pressure_econ'].min()) - 0.5
    max_val = max(all_bowlers['baseline_econ'].max(), all_bowlers['pressure_econ'].max()) + 0.5
    plt.plot([min_val, max_val], [min_val, max_val], 'k--', alpha=0.5, label='Par Line (Pressure Econ = Baseline Econ)')
    plt.fill_between([min_val, max_val], [min_val - 2, min_val - 2], [min_val, max_val], color='#2ca02c', alpha=0.06, label='Clutch Suppression Zone (Lower Econ Under Pressure)')

    top10_ids = set(top10_bowl['player_id'])
    non_top10 = all_bowlers[~all_bowlers['bowler_id'].isin(top10_ids)]
    top10_rows = all_bowlers[all_bowlers['bowler_id'].isin(top10_ids)]

    plt.scatter(
        non_top10['baseline_econ'], non_top10['pressure_econ'],
        s=non_top10['pressure_legal_balls'] * 0.4,
        c='#adb5bd', alpha=0.6, edgecolors='none', label='Other Qualified Bowlers'
    )

    scatter = plt.scatter(
        top10_rows['baseline_econ'], top10_rows['pressure_econ'],
        s=top10_rows['pressure_legal_balls'] * 0.7,
        c=top10_rows['pressure_score'], cmap='viridis', alpha=0.95,
        edgecolors='black', linewidth=1.5, label='Top 10 Ranked Bowlers'
    )

    for _, row in top10_rows.iterrows():
        plt.annotate(
            row['bowler_name'],
            (row['baseline_econ'] + 0.08, row['pressure_econ'] + 0.08),
            fontsize=9.5, fontweight='bold', color='#111111'
        )

    plt.title("Bowling Clutch Performance: Baseline Economy vs Pressure Economy", fontsize=15, fontweight='bold', pad=15)
    plt.xlabel("Baseline Economy Rate (Normal Situations)", fontsize=12)
    plt.ylabel("Pressure Economy Rate (High-Pressure Situations)", fontsize=12)
    plt.xlim(min_val, max_val)
    plt.ylim(min_val, max_val)

    cbar = plt.colorbar(scatter)
    cbar.set_label('Pressure Score (0-100)', rotation=270, labelpad=15)
    plt.legend(loc='upper left', frameon=True, fontsize=10)

    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"Saved: {output_path}")


def plot_pressure_distribution(
    enriched_df: pd.DataFrame,
    output_path: Path = OUTPUT_DIR / "pressure_distribution_by_stage.png"
):
    """Plots distribution of deliveries across pressure levels and match stages."""
    fig, axes = plt.subplots(1, 3, figsize=(18, 5.5))
    fig.suptitle("SupeRR Selector Season 2 — Pressure Distribution & Contextual Signals", fontsize=16, fontweight='bold')

    # 1. Innings vs Pressure Level
    ax1 = axes[0]
    inn_p = enriched_df.groupby(['innings', 'pressure_level']).size().unstack(fill_value=0)
    inn_p_norm = inn_p.div(inn_p.sum(axis=1), axis=0) * 100
    inn_p_norm[['Low', 'Medium', 'High']].plot(
        kind='bar', stacked=True, ax=ax1,
        color=['#74c476', '#fed976', '#e6550d'], edgecolor='white', width=0.65
    )
    ax1.set_title("Pressure Level by Innings", fontsize=12, fontweight='bold')
    ax1.set_xlabel("Innings (1 = Setting Target, 2 = Chasing, 3/4 = Super Over)")
    ax1.set_ylabel("Share of Deliveries (%)")
    ax1.set_xticklabels(['Inn 1', 'Inn 2', 'Inn 3', 'Inn 4'], rotation=0)
    ax1.legend(title='Pressure Level', loc='upper right')

    # 2. Stage vs Pressure Level
    ax2 = axes[1]
    stage_p = enriched_df.groupby(['match_stage', 'pressure_level']).size().unstack(fill_value=0)
    stage_p_norm = stage_p.div(stage_p.sum(axis=1), axis=0) * 100
    # Order stages logically: Powerplay, Middle, Death
    stages_order = ['Powerplay', 'Middle', 'Death']
    stage_p_norm = stage_p_norm.reindex(stages_order)
    stage_p_norm[['Low', 'Medium', 'High']].plot(
        kind='bar', stacked=True, ax=ax2,
        color=['#74c476', '#fed976', '#e6550d'], edgecolor='white', width=0.65
    )
    ax2.set_title("Pressure Level by Match Stage", fontsize=12, fontweight='bold')
    ax2.set_xlabel("Match Stage (Overs 1-6, 7-15, 16-20)")
    ax2.set_ylabel("Share of Deliveries (%)")
    ax2.set_xticklabels(stages_order, rotation=0)
    ax2.legend(title='Pressure Level', loc='upper right')

    # 3. Continuous Pressure Index Distribution
    ax3 = axes[2]
    sns.kdeplot(
        data=enriched_df[enriched_df['innings'] == 1], x='pressure_index',
        ax=ax3, label='1st Innings (Defending)', color='#2b5c8f', fill=True, alpha=0.35, linewidth=2
    )
    sns.kdeplot(
        data=enriched_df[enriched_df['innings'] == 2], x='pressure_index',
        ax=ax3, label='2nd Innings (Chasing)', color='#d62728', fill=True, alpha=0.35, linewidth=2
    )
    ax3.axvline(0.60, color='black', linestyle='--', linewidth=1.5, label='High-Pressure Threshold (0.60)')
    ax3.set_title("Continuous Pressure Index (PI) Density", fontsize=12, fontweight='bold')
    ax3.set_xlabel("Pressure Index (0.0 to 1.0)")
    ax3.set_ylabel("Density")
    ax3.legend(loc='upper right')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"Saved: {output_path}")


def generate_all_visualizations(
    enriched_df: pd.DataFrame,
    batters_df: pd.DataFrame,
    bowlers_df: pd.DataFrame,
    top10_bat: pd.DataFrame,
    top10_bowl: pd.DataFrame
):
    """Executes generation of all 5 figures."""
    print("\nGenerating comprehensive publication visualizations...")
    plot_top10_batters(top10_bat)
    plot_top10_bowlers(top10_bowl)
    plot_batting_pressure_vs_baseline(batters_df, top10_bat)
    plot_bowling_pressure_vs_baseline(bowlers_df, top10_bowl)
    plot_pressure_distribution(enriched_df)
    print("All visualizations created successfully in output/!\n")


if __name__ == "__main__":
    from preprocess import load_raw_data, clean_and_enrich_deliveries
    from pressure_analysis import analyze_batting_pressure, analyze_bowling_pressure
    from rank_players import build_and_export_rankings

    comps, teams, matches, p11, mapping, bbb = load_raw_data()
    df, _ = clean_and_enrich_deliveries(matches, bbb, mapping)
    batters = analyze_batting_pressure(df)
    bowlers = analyze_bowling_pressure(df)
    t10_bat, t10_bowl = build_and_export_rankings(batters, bowlers)
    generate_all_visualizations(df, batters, bowlers, t10_bat, t10_bowl)
