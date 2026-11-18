# SupeRR Selector Season 2 — Round 1 Hackathon Project
**Identifying the Most Reliable Batters and Bowlers Under Pressure**

An end-to-end, reproducible data science project built for **SupeRR Selector Season 2 (Round 1)**. The system models high-pressure T20 match situations across 200,999 delivery-level records (IPL and T20Is from 2022 to 2026), quantifies player output relative to normal baselines (Clutch Delta), applies Bayesian sample-size shrinkage, and produces official Top 10 player rankings with publication-grade visualizations.

---

## 🏆 Official Top 10 Rankings for Unstop Submission

### Top 10 Batters Under Pressure (Select on Unstop Dropdowns):
1. **Babar Azam** (Rank 1) — SR 166.5, Avg 52.3, $\Delta$SR +37.6, Score 76.48
2. **Naman Dhir** (Rank 2) — SR 191.0, Avg 30.8, $\Delta$SR +26.5, Score 74.34
3. **Shashank Singh** (Rank 3) — SR 170.6, Avg 51.1, $\Delta$SR +16.7, Score 73.95
4. **Suryakumar Yadav** (Rank 4) — SR 175.4, Avg 40.5, $\Delta$SR +14.1, Score 72.85
5. **Phil Salt** (Rank 5) — SR 184.4, Avg 40.3, $\Delta$SR +20.7, Score 72.77
6. **Shikhar Dhawan** (Rank 6) — SR 160.2, Avg 54.8, $\Delta$SR +36.3, Score 72.48
7. **Rishabh Pant** (Rank 7) — SR 168.7, Avg 30.7, $\Delta$SR +31.7, Score 72.02
8. **Virat Kohli** (Rank 8) — SR 168.6, Avg 32.6, $\Delta$SR +28.4, Score 71.17
9. **Ryan Rickelton** (Rank 9) — SR 180.0, Avg 32.1, $\Delta$SR +27.2, Score 71.14
10. **Yashasvi Jaiswal** (Rank 10) — SR 179.4, Avg 27.5, $\Delta$SR +28.2, Score 71.03

### Top 10 Bowlers Under Pressure (Select on Unstop Dropdowns):
1. **Mohammad Nawaz** (Rank 1) — Econ 5.96, Wkts 30, Dot% 43.2%, Score 76.48
2. **Sufiyan Muqeem** (Rank 2) — Econ 5.26, Wkts 19, Dot% 55.9%, Score 75.73
3. **Abrar Ahmed** (Rank 3) — Econ 6.07, Wkts 24, Dot% 45.8%, Score 69.18
4. **Sunil Narine** (Rank 4) — Econ 6.53, Wkts 37, Dot% 40.6%, Score 63.32
5. **Mitchell Santner** (Rank 5) — Econ 6.98, Wkts 45, Dot% 39.6%, Score 63.30
6. **Rashid Khan** (Rank 6) — Econ 7.47, Wkts 91, Dot% 38.4%, Score 61.76
7. **Mahedi Hasan** (Rank 7) — Econ 6.62, Wkts 14, Dot% 44.9%, Score 60.78
8. **Jasprit Bumrah** (Rank 8) — Econ 7.35, Wkts 54, Dot% 39.8%, Score 58.22
9. **Hasan Mahmud** (Rank 9) — Econ 7.49, Wkts 13, Dot% 43.1%, Score 57.78
10. **Mujeeb Ur Rahman** (Rank 10) — Econ 6.97, Wkts 15, Dot% 44.3%, Score 57.66

---

## 📁 Project Directory Structure

```
superr-selector/
├── data/                                             # Raw original CSV files & PDF
│   ├── ball_by_ball.csv
│   ├── matches.csv
│   ├── competitions.csv
│   ├── teams.csv
│   ├── playing_eleven.csv
│   ├── competition_team_player_mapping.csv
│   └── Round 1 Problem Statement _ SupeRR Selector Season 2.docx.pdf
├── src/                                              # Modular source code
│   ├── __init__.py
│   ├── inspect_data.py                               # Comprehensive data inspection
│   ├── preprocess.py                                 # Data cleaning, match state tracking, pressure index
│   ├── pressure_analysis.py                          # Batting/bowling models, clutch deltas & shrinkage
│   ├── rank_players.py                               # Ranking engine, player cards & CSV exporters
│   ├── visualizations.py                             # Matplotlib & Seaborn charts
│   └── main.py                                       # Master pipeline runner & test suite
├── tests/                                            # Automated test suite
│   └── test_pipeline.py                              # Formal unittest validation suite
├── frontend/                                         # Interactive React 19 + Vite Web Application
│   ├── src/
│   │   ├── components/                               # Dashboard, Leaderboards, Comparison, Lab, Portal
│   │   ├── data/platform_data.json                   # Consolidated dataset for web platform
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/                                       # 300 DPI publication charts & downloadable artifacts
│   ├── package.json
│   └── tailwind.config.js
├── output/                                           # Final submission artifacts
│   ├── top_10_batters_under_pressure.csv             # Official Top 10 Batters CSV
│   ├── top_10_bowlers_under_pressure.csv             # Official Top 10 Bowlers CSV
│   ├── all_qualified_batters_pressure_metrics.csv    # Full qualified batters metrics
│   ├── all_qualified_bowlers_pressure_metrics.csv    # Full qualified bowlers metrics
│   ├── batters_top10_comparison.png                  # Multi-panel Top 10 Batters dashboard
│   ├── bowlers_top10_comparison.png                  # Multi-panel Top 10 Bowlers dashboard
│   ├── batting_pressure_vs_baseline.png              # Clutch strike rate elevation scatter plot
│   ├── bowling_pressure_vs_baseline.png              # Clutch economy suppression scatter plot
│   └── pressure_distribution_by_stage.png            # Pressure distribution across match stages
├── reports/                                          # Methodology report
│   ├── METHODOLOGY_REPORT.md                         # Complete 12-section technical submission report
│   └── data_inspection.txt                           # Detailed data inspection log
├── requirements.txt                                  # Project dependencies
└── README.md                                         # This documentation
```

---

## 🚀 Quickstart & Reproduction

### 1. Environment Setup
The project uses the existing Python virtual environment in `.venv`:
```bash
# Activate virtual environment
source .venv/bin/activate

# Or install dependencies via pip
pip install -r requirements.txt
```

### 2. Run the Entire Project
To run the full end-to-end pipeline, generate all rankings, plots, and execute automated test assertions:
```bash
python src/main.py
```

### 3. Individual Step Execution (Optional)
```bash
# Data inspection
python src/inspect_data.py

# Preprocessing test
python src/preprocess.py

# Rank players and export CSVs
python src/rank_players.py

# Generate publication visualizations
python src/visualizations.py

# Run comprehensive test suite
python -m unittest discover tests
```

---

## 🌐 Interactive Web Platform (Rajasthan Royals Theme)

The project includes an interactive web application built with **React 19, Vite, Tailwind CSS, Lucide icons, and Framer Motion**, styled in the official **Rajasthan Royals** visual identity (`#E5007D` Royal Pink, `#17132E` Deep Navy, `#641078` Purple):

### Features:
1. **Executive Dashboard**: Real-time KPI counters (883 matches, 200,999 balls, 150 qualified batters, 151 qualified bowlers, 40.8% high-pressure deliveries).
2. **Interactive Leaderboards**: Filter by Top 10 or All 150+ Qualifiers, search by player or team, sort across any metric, and click rows to expand detailed player cards with clutch deltas and match rationale.
3. **Head-to-Head Player Comparison Tool**: Compare any 2 batters or any 2 bowlers side-by-side with metric comparison bars, winner badges, and radar metrics.
4. **Analytics Lab & Visualizations**: Interactive data distributions and full 300 DPI high-resolution modal previews of all publication charts with download buttons.
5. **Unstop Submission Portal**: Interactive checklist with 1-click list copy, verified drop-down guidance, and direct downloads for `METHODOLOGY_REPORT.md` and CSV artifacts.

### Running the Web Platform:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

To generate a standalone production build:
```bash
cd frontend
npm run build
npm run preview
```

---

## 📊 Core Methodology Highlights

1. **Contextual Pressure Index ($PI \in [0, 1]$)**:
   - **Chasing (Innings 2)**: Dynamic tracking of Required Run Rate ($RRR$), balls remaining, and wickets in hand. High pressure is triggered when $RRR \ge 10.0$ or during death finishes ($over \ge 16$, $RRR \in [6, 22]$), while filtering out blowouts and garbage time.
   - **First Innings (Innings 1)**: Explicitly avoids applying RRR (per official guidelines), utilizing death-overs acceleration (overs 16–20) and top-order crisis recovery ($\ge 3$ wickets lost in powerplay).
   - **Super Overs**: 100% maximum pressure ($PI = 1.0$).
   - **Knockout Fixtures**: Contextual multiplier for playoff fixtures.

2. **Clutch Delta ($\Delta$)**:
   - Compares high-pressure performance directly against each player's usual career baseline:
     - Batting: $\Delta SR = SR_P - SR_{\text{overall}}$
     - Bowling: $\Delta Econ = Econ_{\text{overall}} - Econ_P$

3. **Sample Size Adjustment & Bayesian Shrinkage**:
   - Qualification gate: Minimum 150 pressure deliveries and 10 matches.
   - Shrinkage towards population mean with $K = 100$ balls to reward sustained, large-sample excellence over fleeting small-sample spikes.

---

## 📝 What to Submit for Round 1 on Unstop

1. **Component 1 — Player Rankings (Dropdowns)**:
   - In the Unstop submission interface, use the dropdown fields to select the **Top 10 Batters** and **Top 10 Bowlers** in exact rank order (1 through 10) as listed in `output/top_10_batters_under_pressure.csv` and `output/top_10_bowlers_under_pressure.csv`.
2. **Component 2 — Methodology Report (Document Upload)**:
   - Upload `reports/METHODOLOGY_REPORT.md` (or convert to PDF using markdown-to-pdf if desired).
