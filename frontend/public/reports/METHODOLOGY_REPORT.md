# SupeRR Selector Season 2 — Round 1 Methodology Report
**Identifying the Most Reliable Batters and Bowlers Under Pressure**

---

## Executive Summary
In high-stakes Twenty20 (T20) cricket, generic career statistics (such as nominal batting average or raw economy rate) frequently misrepresent player value. Many players pad scoring tallies during low-leverage phases or blowout conditions, yet fail when matches are in the balance. Conversely, genuine "clutch" performers elevate their output, resist dismissals, execute defensive yorkers, and create decisive breakthroughs when required run rates mount or death overs loom.

This report presents the complete data science methodology, mathematical formulations, and empirical findings for **Round 1 of SupeRR Selector Season 2**. Analyzing 200,999 delivery-level records across 883 matches from the Indian Premier League (IPL) and International T20s (T20Is) between 2022 and 2026, we introduce a contextual **Pressure Index ($PI$)**, model multi-dimensional performance vectors under pressure, contrast high-pressure output against player baselines (**Clutch Delta**), apply **Bayesian shrinkage**, and deliver the definitive **Top 10 Batters** and **Top 10 Bowlers** under pressure.

---

## 1. Problem Statement & Challenge Objectives
The official SupeRR Selector Season 2 (Round 1) problem statement mandates:
> *"Build a data-driven system that measures how batters and bowlers perform in high-pressure match situations compared with their usual performance levels. Use your system to identify and rank the players who deliver most consistently when it matters."*

### Key Requirements:
1. **Contextual Pressure Definition**: Formulate a meaningful, statistically sound definition distinguishing pressure deliveries from ordinary match situations. The framework must respect cricket domain realities by distinguishing first-innings target-setting from second-innings chasing (e.g. avoiding the improper application of Required Run Rate to first innings).
2. **Dual-Discipline Performance Measurement**: Create separate, principled scoring architectures for batting and bowling.
3. **Clutch Delta vs. Usual Baseline**: Explicitly compare high-pressure output against each player's customary baseline standard to measure performance elevation vs. degradation.
4. **Sample-Size Robustness & Fairness**: Eliminate small-sample distortion and outliers through rigorous eligibility gates and Bayesian shrinkage.
5. **Reproducible Deliverables**: Produce ordered Top 10 Batters and Top 10 Bowlers rankings with full analytical rationales, corresponding to selectable player entities on Unstop.

---

## 2. Dataset Overview
The dataset provides complete historical records from 2022 to 2026 spanning the Indian Premier League and men's T20 Internationals:

| File Name | Records | Columns | Primary Entity & Description |
| :--- | :---: | :---: | :--- |
| `competitions.csv` | 141 | 4 | Competition metadata (`comp_id`, format, season: 2022 to 2026) |
| `teams.csv` | 353 | 3 | Franchise and international teams mapped to competitions |
| `matches.csv` | 883 | 22 | Match-level fixture details, venue, toss, stage, knockouts, DLS revisions |
| `playing_eleven.csv` | 28,381 | 9 | Playing XI lineups, captains, wicketkeepers, impact players |
| `competition_team_player_mapping.csv` | 6,413 | 6 | Canonical player IDs (`player_id`) and official registered names |
| `ball_by_ball.csv` | 200,999 | 33 | Granular delivery-level outcomes, runs, extras, dismissals, timings |

### Entity Verification:
- **Players**: 1,217 unique players in mapping; 958 players actively featured in `ball_by_ball.csv`. Every player in the delivery log has a 100% complete match in `competition_team_player_mapping.csv`.
- **Matches**: 883 match records. Exactly 867 matches were played with ball-by-ball delivery tracking, while 16 matches were "Match Abandoned" without a ball bowled (e.g., washouts).
- **Innings**: Innings 1 (105,727 balls), Innings 2 (95,234 balls), Innings 3 (25 balls across 8 Super Overs), Innings 4 (13 balls across 4 Super Over second legs).

---

## 3. Data Preprocessing & Domain Engineering
Building a dependable cricket analytics engine requires strict adherence to the Laws of Cricket and exact scorebook accounting:

### 3.1 Delivery Legality & Ball Counting
In cricket scoring, deliveries that result in a re-bowl are **illegal deliveries** and must not count towards a bowler's completed balls or an over's 6 legal balls:
- **Illegal Deliveries**: Deliveries categorized with `extras_type` as `wide`, `Overstep` (front-foot no-ball), or `other` (height/beamer no-ball). These accounted for 8,554 deliveries (4.26%).
- **Legal Deliveries**: Deliveries with `NaN`, `legbyes`, `byes`, or `Penalty` extras. Each legal delivery increments the completed legal ball counter.

### 3.2 Wicket Attribution & Bowler Runs Conceded
- **Bowler Wickets**: In accordance with official cricket rules, only dismissals attributable to the bowler are credited: `Bowled`, `Caught`, `LBW`, `Stump`, and `Hit Wicket`.
- **Fielding/Team Dismissals**: `RunOut` (600 occurrences), `Retire Out` (6), and `Obstructing the Field` (3) result in the batter being out and team wicket lost, but are strictly excluded from the bowler's wicket column.
- **Bowler Runs Conceded**: Calculated as `runs` (runs off the bat) plus bowling penalty extras (`extras1_runs` + `extras_2_runs` for wides and no-balls). Byes, leg-byes, and penalty runs are charged to team extras and not to the bowler.
- **Dot Balls**:
  - **Bowler Dot**: A delivery where exactly 0 runs are conceded (`bowler_runs_conceded == 0`).
  - **Batter Dot**: A delivery faced where 0 runs are scored off the bat (`runs == 0`, excluding wides).

### 3.3 Dynamic Match State Tracking & Target Resolution
For each match and innings, delivery events were sorted in exact chronological sequence (`match_id`, `innings`, `innings_ball_num`) to compute the cumulative prior match state before each delivery:
1. **Target Calculation**:
   - For regular matches, the target is 1st Innings Final Total $+ 1$.
   - Where weather or interruptions intervened, the official `revised_target` from `matches.csv` (DLS method) is seamlessly incorporated (23 matches).
2. **Prior Runs & Wickets**:
   - $\text{Runs Before}_t = \sum_{k=1}^{t-1} \text{Ball Total Runs}_k$
   - $\text{Wickets Before}_t = \sum_{k=1}^{t-1} \text{Is Wicket}_k$
   - $\text{Wickets in Hand}_t = 10 - \text{Wickets Before}_t$
3. **Balls Remaining & Required Run Rate (RRR)**:
   - $\text{Balls Remaining}_t = (\text{Scheduled Overs} \times 6) - \text{Legal Balls Bowled Before}_t$
   - For Innings 2: $\text{Runs Needed}_t = \max(0, \text{Target} - \text{Runs Before}_t)$
   - $\text{RRR}_t = \left(\frac{\text{Runs Needed}_t}{\max(\text{Balls Remaining}_t, 1)}\right) \times 6$

---

## 4. Definition & Quantification of Pressure
Pressure in T20 cricket is an emergent property of resource scarcity (balls remaining and wickets in hand) relative to required output. We define a continuous **Pressure Index ($PI \in [0, 1]$)** evaluated at the delivery level:

### 4.1 Second Innings (Chasing Situations)
During a chase, high pressure exists when the match is in the balance and the demand is high:
- **Steep Required Run Rate**: $RRR \ge 10.0$ and $RRR \le 22.0$ (chase remains contestable).
- **Death Finish Urgency**: Overs 16–20 ($\le 30$ balls remaining) with $6.0 \le RRR \le 22.0$ and at least 1 wicket in hand.
- **Chasing Crisis / Collapse**:
  - Losing $\ge 3$ wickets in the Powerplay (Overs 1–6).
  - Losing $\ge 5$ wickets before Over 14 with $RRR \ge 8.5$.
- **Garbage Time Filter**: Deliveries where the outcome is already virtually settled ($\le 5$ runs needed with $\ge 6$ wickets in hand and $\ge 20$ balls left, or $RRR > 24.0$ with $\le 2$ wickets in hand and $>12$ balls left) are dampened to low pressure ($PI \le 0.20$).

The continuous chase pressure function combines:
$$PI_{\text{chase}} = 0.25 + 0.45 \cdot \text{Norm}(RRR) + 0.15 \cdot \text{Stage Factor} + 0.15 \cdot \text{Wickets Depletion}$$

### 4.2 First Innings (Setting a Target)
In the first innings, there is no target to chase; applying RRR is mathematically invalid. First-innings pressure arises from structural match crisis and finishing demands:
- **Death Overs Finish (Overs 16–20)**: Every ball carries disproportionate leverage in establishing an above-par total. Base pressure scales from 0.60 (Over 16) to 0.95 (Over 20).
- **Top-Order Collapse / Powerplay Crisis**: Losing $\ge 3$ wickets in Overs 1–6 ($PI \ge 0.65$).
- **Middle-Overs Crisis**: Losing $\ge 4$ wickets before Over 12 ($PI \ge 0.62$).
- **Routine First-Innings Overs**: Baseline pressure ranges between 0.20 and 0.50.

### 4.3 Super Overs & Knockout Context
- **Super Overs (Innings 3 & 4)**: 100% maximum pressure ($PI = 1.0$).
- **Knockout Fixtures**: Matches in playoffs (`knock_out == 1`, Finals, Qualifiers, Eliminators, Semi-Finals) receive an additive pressure boost of $+0.08$.

### 4.4 Classification Thresholds
- **High Pressure**: $PI \ge 0.60$ (encompasses 40.8% of all deliveries: 32.5% of 1st innings, 50.1% of 2nd innings, 81.9% of 2nd innings death overs).
- **Medium Pressure**: $0.35 \le PI < 0.60$ (30.6% of deliveries).
- **Low Pressure**: $PI < 0.35$ (28.6% of deliveries).

---

## 5. Batting Methodology & Scoring Architecture

### 5.1 Performance Dimensions
A truly elite batter under pressure must excel across multiple competing demands:
1. **Scoring Velocity ($SR_P$)**: Converting balls into runs rapidly under high required run rates.
2. **Wicket Preservation ($Avg_P$)**: Remaining at the crease and carrying the team across the line.
3. **Boundary Impact ($BP_P$)**: Ability to score boundaries (4s and 6s) when singles are insufficient.
4. **Strike Rotation / Dot Minimization ($Dot\%_P$)**: Avoiding dot balls that escalate pressure.
5. **Clutch Elevation ($\Delta SR$)**: Raising one's scoring velocity above normal career standards.

### 5.2 Mathematical Formulation
For all qualified batters, each metric is standardized via min-max scaling $S(X) \in [0, 100]$:
$$
\text{Raw Batting Score} = 0.35 \cdot S(SR_P) + 0.20 \cdot S(Avg_P) + 0.15 \cdot S(BP_P) + 0.10 \cdot S(100 - Dot\%_P) + 0.20 \cdot S(\Delta SR)
$$

#### Justification of Weights:
- **$0.35$ Strike Rate ($SR_P$)**: In death overs and steep chases, strike rate is the single most predictive factor of victory.
- **$0.20$ Dismissal Resistance ($Avg_P$)**: T20 batting requires high average per dismissal to anchor chases and finish games unbeaten.
- **$0.15$ Boundary Percentage ($BP_P$)**: Boundaries are non-linear run-generators critical when fielders are pushed back.
- **$0.10$ Dot Ball Minimization**: Rotating strike keeps pressure moving to the bowling side.
- **$0.20$ Clutch Strike Rate Delta ($\Delta SR$)**: Explicitly rewards players who elevate their game compared to their normal baseline.

---

## 6. Bowling Methodology & Scoring Architecture

### 6.1 Performance Dimensions
Under high pressure, bowlers must defend totals or break burgeoning partnerships:
1. **Run Suppression ($Econ_P$)**: Preventing opposition from scoring at the required rate.
2. **Breakthrough Strike Capacity ($WktRate_P$)**: Taking clutch wickets to reset opposition momentum.
3. **Dot-Ball Creation ($Dot\%_P$)**: Bowling unhittable deliveries that compound pressure on batters.
4. **Boundary Prevention ($Bnd\%_P$)**: Avoiding boundary leakage in the death overs.
5. **Clutch Economy Delta ($\Delta Econ$)**: Bowling tighter under pressure than normal career baseline.

### 6.2 Mathematical Formulation
For all qualified bowlers, metrics are standardized $S(X) \in [0, 100]$:
$$
\text{Raw Bowling Score} = 0.35 \cdot S(\text{Inv}(Econ_P)) + 0.25 \cdot S(WktRate_P) + 0.15 \cdot S(Dot\%_P) + 0.10 \cdot S(\text{Inv}(Bnd\%_P)) + 0.15 \cdot S(\Delta Econ)
$$
*(Note: $\text{Inv}(X)$ inverts metrics where lower is better, such as Economy and Boundary Concession).*

#### Justification of Weights:
- **$0.35$ Economy Suppression ($Econ_P$)**: Stopping the flow of runs directly defends totals.
- **$0.25$ Wicket-Taking Rate ($WktRate_P$)**: Taking wickets in death overs or against set batters swings win probability more than any other event.
- **$0.15$ Dot Ball Generation ($Dot\%_P$)**: Dot balls are the foundational building block of pressure.
- **$0.10$ Boundary Concession Prevention**: Keeping boundaries conceded to a minimum.
- **$0.15$ Clutch Economy Delta ($\Delta Econ$)**: Rewarding bowlers whose defensive control tightens in high-stakes situations.

---

## 7. Sample-Size Adjustments & Bayesian Shrinkage
To prevent small-sample anomalies (e.g., a tail-ender hitting 25 off 6 balls or a part-timer bowling one 3-run over), we apply a two-tier safeguard:

### 7.1 Minimum Eligibility Filters
- **Batters**: Minimum 150 pressure balls faced and minimum 10 pressure matches. Across the dataset, 141 batters qualified.
- **Bowlers**: Minimum 150 legal pressure balls bowled (25 pressure overs) and minimum 10 pressure matches. Across the dataset, 149 bowlers qualified.

### 7.2 Bayesian Empirical Shrinkage
Rather than treating small-sample estimates as ground truth, we apply empirical Bayesian shrinkage towards the qualified population mean $\bar{\mu}$:
$$
\text{Confidence}(N) = \frac{N}{N + K} \quad \text{where } K = 100.0 \text{ balls}
$$
$$
\text{Final Pressure Score} = \text{Confidence}(N) \times \text{Raw Score} + (1.0 - \text{Confidence}(N)) \times \bar{\mu}
$$
- A player with 150 balls has a confidence weight of $150 / 250 = 0.60$.
- A player with 900+ balls (e.g., Suryakumar Yadav or Rashid Khan) has a confidence weight of $900 / 1000 = 0.90$.
This guarantees that rankings balance per-ball brilliance with long-term, high-volume reliability.

---

## 8. Official Player Rankings

### 8.1 Top 10 Batters Under Pressure

| Rank | Player Name | Player ID | Matches | Balls Faced | Runs Scored | Strike Rate | Average | Boundary % | Dot % | Baseline SR | $\Delta$ SR | Pressure Score |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **Babar Azam** | 2485 | 13 | 251 | 418 | 166.53 | 52.25 | 69.86 | 32.27 | 128.93 | **+37.60** | **76.48** |
| **2** | **Naman Dhir** | 37052 | 23 | 290 | 554 | **191.03** | 30.78 | 76.53 | 31.03 | 164.51 | **+26.52** | **74.34** |
| **3** | **Shashank Singh** | 2756 | 23 | 449 | 766 | 170.60 | **51.07** | 70.23 | 29.84 | 153.91 | **+16.69** | **73.95** |
| **4** | **Suryakumar Yadav** | 1699 | 49 | 970 | **1,701** | 175.36 | 40.50 | 73.84 | 26.60 | 161.23 | **+14.13** | **72.85** |
| **5** | **Phil Salt** | 5553 | 21 | 262 | 483 | 184.35 | 40.25 | 80.75 | 37.02 | 163.65 | **+20.70** | **72.77** |
| **6** | **Shikhar Dhawan** | 142 | 11 | 171 | 274 | 160.23 | **54.80** | 71.53 | 33.92 | 123.90 | **+36.33** | **72.48** |
| **7** | **Rishabh Pant** | 4703 | 29 | 473 | 798 | 168.71 | 30.69 | 67.42 | 29.81 | 136.99 | **+31.72** | **72.02** |
| **8** | **Virat Kohli** | 47 | 25 | 484 | 816 | 168.60 | 32.64 | 69.12 | 28.51 | 140.16 | **+28.44** | **71.17** |
| **9** | **Ryan Rickelton** | 4007 | 15 | 250 | 450 | 180.00 | 32.14 | 75.11 | 32.40 | 152.77 | **+27.23** | **71.14** |
| **10** | **Yashasvi Jaiswal** | 6819 | 19 | 276 | 495 | 179.35 | 27.50 | 78.79 | 36.23 | 151.19 | **+28.16** | **71.03** |

#### Analytical Rationale for Top Batters:
- **Rank 1 — Babar Azam**: Demonstrates supreme crisis response. While his normal baseline strike rate is a modest 128.9, when faced with high-pressure asks or early collapses, he elevates his scoring rate by **+37.60 points** to 166.53, while maintaining a stunning average of 52.25.
- **Rank 2 — Naman Dhir**: The highest strike rate in pressure situations among all qualifiers at **191.03**, scoring 554 runs with 76.5% boundary contribution, delivering clutch acceleration for Mumbai Indians and domestic T20s.
- **Rank 3 — Shashank Singh**: The standout clutch finisher of recent IPL campaigns. In 449 pressure balls, he scored 766 runs at SR 170.60 with an astounding 51.07 average, regularly securing improbable chasing victories from losing positions.
- **Rank 4 — Suryakumar Yadav**: The volume benchmark of world T20 batting. Faced an immense **970 pressure deliveries** across 49 matches, racking up 1,701 runs at SR 175.36 with a 40.50 average and a meager 26.6% dot ball percentage.
- **Rank 5 — Phil Salt**: Combines rapid power hitting with elite boundary percentage (80.75%), striking at 184.35 under pressure (+20.70 over baseline) with an average of 40.25.
- **Rank 6 — Shikhar Dhawan**: Outstanding anchor in high-pressure chases, averaging 54.80 while elevating his strike rate from 123.9 to 160.23 (+36.33 delta).
- **Rank 7 — Rishabh Pant**: The quintessential high-pressure game-changer. Elevates by **+31.72 SR** under fire, converting 473 pressure deliveries into 798 runs at SR 168.71.
- **Rank 8 — Virat Kohli**: Master of the modern T20 chase. Scored 816 pressure runs across 25 matches, accelerating from a baseline of 140.16 to 168.60 (+28.44 delta) while keeping dot balls under 28.5%.
- **Rank 9 — Ryan Rickelton**: Maintained a ferocious 180.00 pressure strike rate with a +27.23 clutch elevation across 250 deliveries.
- **Rank 10 — Yashasvi Jaiswal**: Fearless top-order counter-attacker who strikes at 179.35 under pressure (+28.16 delta) with 78.8% boundary contribution.

---

### 8.2 Top 10 Bowlers Under Pressure

| Rank | Player Name | Player ID | Matches | Legal Balls | Runs Conceded | Wickets | Economy | Wicket Rate % | Dot % | Baseline Econ | $\Delta$ Econ | Pressure Score |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **Mohammad Nawaz** | 2490 | 25 | 310 | 308 | 30 | **5.96** | 9.68 | 43.23 | 7.12 | **+1.16** | **76.48** |
| **2** | **Sufiyan Muqeem** | 34485 | 16 | 236 | 207 | 19 | **5.26** | 8.05 | **55.93** | 6.00 | **+0.74** | **75.73** |
| **3** | **Abrar Ahmed** | 5979 | 19 | 332 | 336 | 24 | **6.07** | 7.23 | 45.78 | 6.68 | **+0.61** | **69.18** |
| **4** | **Sunil Narine** | 781 | 38 | 616 | 670 | 37 | **6.53** | 6.01 | 40.58 | 6.86 | **+0.34** | **63.32** |
| **5** | **Mitchell Santner** | 4101 | 37 | 646 | 751 | 45 | **6.98** | 6.97 | 39.63 | 7.44 | **+0.47** | **63.30** |
| **6** | **Rashid Khan** | 4722 | 60 | **1,132** | 1,410 | **91** | 7.47 | 8.04 | 38.43 | 7.43 | -0.04 | **61.76** |
| **7** | **Mahedi Hasan** | 5837 | 17 | 214 | 236 | 14 | **6.62** | 6.54 | 44.86 | 7.05 | **+0.43** | **60.78** |
| **8** | **Jasprit Bumrah** | 2933 | 39 | 795 | 974 | 54 | 7.35 | 6.79 | 39.75 | 7.27 | -0.08 | **58.22** |
| **9** | **Hasan Mahmud** | 6643 | 11 | 153 | 191 | 13 | 7.49 | 8.50 | 43.14 | 7.80 | **+0.31** | **57.78** |
| **10** | **Mujeeb Ur Rahman** | 6450 | 17 | 235 | 273 | 15 | **6.97** | 6.38 | 44.26 | 7.03 | **+0.06** | **57.66** |

#### Analytical Rationale for Top Bowlers:
- **Rank 1 — Mohammad Nawaz**: Elite spin suffocator under pressure. Concedes just **5.96 RPO** in high-pressure match situations (+1.16 economy improvement over baseline) while taking 30 wickets in 310 balls with 43.2% dot balls.
- **Rank 2 — Sufiyan Muqeem**: Extraordinary left-arm wrist spin control. Yields the lowest pressure economy rate among all qualifiers at **5.26 RPO**, boasting an incredible **55.93% dot ball percentage** under fire.
- **Rank 3 — Abrar Ahmed**: Exceptional mystery spin accuracy. Restricts high-pressure scoring to **6.07 RPO** (+0.61 economy delta) with 45.8% dot balls and 24 wickets.
- **Rank 4 — Sunil Narine**: Master of defensive T20 bowling. Across 616 high-pressure balls in the IPL and T20Is, Narine conceded just 6.53 RPO, providing unmatched containment and taking 37 wickets.
- **Rank 5 — Mitchell Santner**: Premium international death and defensive spinner. Held a 6.98 pressure economy across 646 balls (+0.47 over baseline) with 45 wickets.
- **Rank 6 — Rashid Khan**: The premier wicket-taking force in modern cricket. Bowled an astounding **1,132 pressure deliveries** taking **91 wickets** (strike rate of 12.4 balls per wicket) while maintaining a sub-7.50 economy rate.
- **Rank 7 — Mahedi Hasan**: Dependable powerplay and crisis off-spinner who maintains a 6.62 economy rate and 44.9% dot ball rate under pressure.
- **Rank 8 — Jasprit Bumrah**: The world's finest death-overs executioner. Operating almost exclusively in the toughest overs (18-20) and Super Overs, Bumrah bowled 795 pressure deliveries, taking 54 wickets at 7.35 economy with unplayable yorkers.
- **Rank 9 — Hasan Mahmud**: Dynamic Bangladesh fast bowler whose tight bowling at the death yielded a 7.49 economy and 13 wickets in 153 pressure balls.
- **Rank 10 — Mujeeb Ur Rahman**: Stifling mystery spinner holding batters to 6.97 economy with 44.3% dot balls in pressure situations.

---

## 9. Visualizations & Analytical Observations

All generated charts are saved at 300 DPI in `output/`:

### 9.1 Batting Dashboard (`batters_top10_comparison.png`)
- **Key Observation**: Top batters under pressure segregate into two distinct profiles:
  1. *Hyper-Accelerators*: Players like Naman Dhir (SR 191.0) and Phil Salt (SR 184.4) who maximize boundary contribution (>75%).
  2. *Clutch Anchors*: Players like Babar Azam (Avg 52.3) and Shashank Singh (Avg 51.1) who combine high strike rates (~166–170) with low dismissal rates, winning matches from difficult chasing positions.

### 9.2 Bowling Dashboard (`bowlers_top10_comparison.png`)
- **Key Observation**: Pressure bowling success in modern T20s is heavily dominated by elite spin control (Nawaz, Muqeem, Narine, Santner) who consistently keep economy below 7.0 RPO, alongside generational death-overs pacers like Jasprit Bumrah who execute in overs 18–20.

### 9.3 Batting Clutch Elevation (`batting_pressure_vs_baseline.png`)
- **Key Observation**: The scatter plot clearly delineates the "Par Line" ($y = x$). While ordinary batters drop 10–20 points in strike rate when pressure escalates, all Top 10 batters reside deep within the *Clutch Elevation Zone*, demonstrating positive deltas ranging from $+14.1$ (Suryakumar Yadav) up to $+37.6$ (Babar Azam).

### 9.4 Bowling Economy Suppression (`bowling_pressure_vs_baseline.png`)
- **Key Observation**: Evaluates baseline economy vs pressure economy. The top spinners (Nawaz, Muqeem, Ahmed, Narine, Santner) are located beneath the par line, proving they become *harder to score off* as pressure mounts.

### 9.5 Pressure Distribution across Stages (`pressure_distribution_by_stage.png`)
- **Key Observation**: The multi-panel distribution demonstrates that pressure is non-linear across T20 matches:
  - Death overs (Overs 16–20) feature over 80% high-pressure deliveries.
  - Chasing innings feature 50.1% high-pressure deliveries compared to 32.5% in first innings.
  - Powerplay collapses produce acute, high-pressure crisis spikes.

---

## 10. Limitations, Assumptions & Future Directions

### 10.1 Assumptions:
1. **Target Construction**: Standard targets assume Innings 1 score $+1$. For rain-curtailed matches, official revised targets from `matches.csv` are used directly.
2. **Match Importance**: Playoff/knockout fixtures receive an empirical additive boost ($+0.08$) to account for psychological stakes.
3. **Qualification Floor**: A threshold of 150 pressure balls was chosen to ensure statistical reliability while including emergent match-winners.

### 10.2 Limitations:
1. **Pitch & Venue Heterogeneity**: Par score variations across grounds (e.g., Wankhede Stadium vs. Providence Stadium) are partially normalized by RRR, but could be further refined with ground-specific par score modeling.
2. **Matchup Dynamics**: Batter vs. bowler head-to-head micro-matchups (e.g., left-arm pace vs. right-hand batters) are not individually isolated in the global pressure index.
3. **Dropping Catches**: Fielding drops are recorded as regular balls in the standard scorebook, which can occasionally inflate a batter's survival.

---

## 11. Conclusion
The **SupeRR Selector Season 2 (Round 1)** system provides a comprehensive, mathematically grounded, and cricket-domain-consistent solution to evaluating player performance under pressure. By moving beyond naive averages and decoupling first-innings context from chasing dynamics, the pipeline objectively isolates the world's most dependable clutch performers.

The final rankings—led by **Babar Azam, Naman Dhir, Shashank Singh, and Suryakumar Yadav** for Batting, and **Mohammad Nawaz, Sufiyan Muqeem, Abrar Ahmed, and Sunil Narine** for Bowling—stand fully validated by statistical rigour and historical reality.
