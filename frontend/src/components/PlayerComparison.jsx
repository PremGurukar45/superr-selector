import React, { useState, useMemo } from 'react';
import { Users, Flame, Trophy, Award, CheckCircle, ArrowRight, Zap, Target, Crown, Sparkles } from 'lucide-react';
import { getPlayerPhoto, getPlayerInitials } from '../utils/playerPhotos';

export default function PlayerComparison({ allBatters, allBowlers, initialPlayerA, initialPlayerB, initialType = 'batter' }) {
  const [discipline, setDiscipline] = useState(initialType);
  
  // Default selections
  const playerList = discipline === 'batter' ? allBatters : allBowlers;
  
  const [playerAId, setPlayerAId] = useState(
    initialPlayerA ? (initialPlayerA.player_id || initialPlayerA.striker_id || initialPlayerA.bowler_id) : (playerList[0]?.player_id || playerList[0]?.striker_id || playerList[0]?.bowler_id)
  );
  const [playerBId, setPlayerBId] = useState(
    initialPlayerB ? (initialPlayerB.player_id || initialPlayerB.striker_id || initialPlayerB.bowler_id) : (playerList[1]?.player_id || playerList[1]?.striker_id || playerList[1]?.bowler_id)
  );

  // Sync if discipline changes
  const handleDisciplineChange = (type) => {
    setDiscipline(type);
    const list = type === 'batter' ? allBatters : allBowlers;
    setPlayerAId(list[0]?.player_id || list[0]?.striker_id || list[0]?.bowler_id);
    setPlayerBId(list[1]?.player_id || list[1]?.striker_id || list[1]?.bowler_id);
  };

  const playerA = useMemo(() => {
    return playerList.find(p => (p.player_id || p.striker_id || p.bowler_id) === Number(playerAId)) || playerList[0];
  }, [playerList, playerAId]);

  const playerB = useMemo(() => {
    return playerList.find(p => (p.player_id || p.striker_id || p.bowler_id) === Number(playerBId)) || playerList[1];
  }, [playerList, playerBId]);

  if (!playerA || !playerB) return null;

  const isBatter = discipline === 'batter';

  const nameA = playerA.player_name || playerA.striker_name || playerA.bowler_name;
  const nameB = playerB.player_name || playerB.striker_name || playerB.bowler_name;
  const photoA = getPlayerPhoto(nameA);
  const photoB = getPlayerPhoto(nameB);

  // Metrics definitions for Batters vs Bowlers
  const metrics = isBatter ? [
    { label: 'Pressure Score', keyA: playerA.pressure_score, keyB: playerB.pressure_score, higherBetter: true, unit: '/100' },
    { label: 'Pressure Strike Rate', keyA: playerA.strike_rate || playerA.pressure_sr, keyB: playerB.strike_rate || playerB.pressure_sr, higherBetter: true, unit: 'r/100b' },
    { label: 'Pressure Average', keyA: playerA.average || playerA.pressure_avg, keyB: playerB.average || playerB.pressure_avg, higherBetter: true, unit: 'r/out' },
    { label: 'Clutch Delta (ΔSR)', keyA: playerA.delta_sr, keyB: playerB.delta_sr, higherBetter: true, unit: 'SR', prefix: '+' },
    { label: 'Boundary Contribution', keyA: playerA.boundary_percent || playerA.pressure_boundary_pct, keyB: playerB.boundary_percent || playerB.pressure_boundary_pct, higherBetter: true, unit: '%' },
    { label: 'Dot Ball Rate', keyA: playerA.dot_percent || playerA.pressure_dot_pct, keyB: playerB.dot_percent || playerB.pressure_dot_pct, higherBetter: false, unit: '%' },
    { label: 'Pressure Balls Faced', keyA: playerA.balls_faced || playerA.pressure_balls_faced, keyB: playerB.balls_faced || playerB.pressure_balls_faced, higherBetter: true, unit: 'balls' },
    { label: 'Pressure Runs Scored', keyA: playerA.runs_scored || playerA.pressure_runs, keyB: playerB.runs_scored || playerB.pressure_runs, higherBetter: true, unit: 'runs' },
  ] : [
    { label: 'Pressure Score', keyA: playerA.pressure_score, keyB: playerB.pressure_score, higherBetter: true, unit: '/100' },
    { label: 'Pressure Economy', keyA: playerA.economy_rate || playerA.pressure_econ, keyB: playerB.economy_rate || playerB.pressure_econ, higherBetter: false, unit: 'rpo' },
    { label: 'Pressure Wickets', keyA: playerA.wickets || playerA.pressure_wickets, keyB: playerB.wickets || playerB.pressure_wickets, higherBetter: true, unit: 'wkts' },
    { label: 'Economy Suppression (ΔEcon)', keyA: playerA.delta_econ, keyB: playerB.delta_econ, higherBetter: true, unit: 'RPO', prefix: '+' },
    { label: 'Dot Ball Rate', keyA: playerA.dot_percent || playerA.pressure_dot_pct, keyB: playerB.dot_percent || playerB.pressure_dot_pct, higherBetter: true, unit: '%' },
    { label: 'Boundary Conceded Rate', keyA: playerA.boundary_conceded_percent || playerA.pressure_boundary_pct, keyB: playerB.boundary_conceded_percent || playerB.pressure_boundary_pct, higherBetter: false, unit: '%' },
    { label: 'Pressure Legal Balls', keyA: playerA.legal_balls || playerA.pressure_legal_balls, keyB: playerB.legal_balls || playerB.pressure_legal_balls, higherBetter: true, unit: 'balls' },
    { label: 'Pressure Runs Conceded', keyA: playerA.runs_conceded || playerA.pressure_runs_conceded, keyB: playerB.runs_conceded || playerB.pressure_runs_conceded, higherBetter: false, unit: 'runs' },
  ];

  // Advantage count
  let winsA = 0;
  let winsB = 0;
  metrics.forEach(m => {
    if (m.higherBetter ? m.keyA > m.keyB : m.keyA < m.keyB) winsA++;
    else if (m.higherBetter ? m.keyB > m.keyA : m.keyB < m.keyA) winsB++;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-purple-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5007D]/10 text-[#E5007D] text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Head-to-Head Scout Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-[#17132E] tracking-tight">
            PLAYER <span className="text-[#E5007D]">COMPARISON ARENA</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Compare any two players side-by-side across their pressure statistics, baseline deltas, and clutch metrics.
          </p>
        </div>

        {/* Discipline Toggle */}
        <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-purple-100 self-start md:self-auto">
          <button
            onClick={() => handleDisciplineChange('batter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isBatter
                ? 'bg-gradient-to-r from-[#E5007D] to-[#641078] text-white shadow-md shadow-[#E5007D]/20'
                : 'text-gray-600 hover:text-[#17132E]'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Batters</span>
          </button>
          <button
            onClick={() => handleDisciplineChange('bowler')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              !isBatter
                ? 'bg-gradient-to-r from-[#641078] to-[#17132E] text-white shadow-md shadow-purple-900/20'
                : 'text-gray-600 hover:text-[#17132E]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Bowlers</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selector A */}
        <div className="bg-white p-4 rounded-2xl border border-pink-200 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-2">
            Select Contender 01
          </label>
          <select
            value={playerAId}
            onChange={(e) => setPlayerAId(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#F7F4FC] border border-purple-100 text-sm font-bold text-[#17132E] focus:outline-none focus:ring-2 focus:ring-[#E5007D]"
          >
            {playerList.map((p) => {
              const pid = p.player_id || p.striker_id || p.bowler_id;
              const pname = p.player_name || p.striker_name || p.bowler_name;
              return (
                <option key={pid} value={pid}>
                  #{p.rank || '-'} {pname} ({p.team})
                </option>
              );
            })}
          </select>
        </div>

        {/* Selector B */}
        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-[#641078] block mb-2">
            Select Contender 02
          </label>
          <select
            value={playerBId}
            onChange={(e) => setPlayerBId(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#F7F4FC] border border-purple-100 text-sm font-bold text-[#17132E] focus:outline-none focus:ring-2 focus:ring-[#641078]"
          >
            {playerList.map((p) => {
              const pid = p.player_id || p.striker_id || p.bowler_id;
              const pname = p.player_name || p.striker_name || p.bowler_name;
              return (
                <option key={pid} value={pid}>
                  #{p.rank || '-'} {pname} ({p.team})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* =========================================================================
          AUTHENTIC RAJASTHAN ROYALS BATTLE ARENA CARDS
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        
        {/* Contender A Card */}
        <div className="md:col-span-5 bg-gradient-to-b from-white to-[#F7F4FC] rounded-3xl p-6 border-2 border-pink-400/50 shadow-rr-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5007D]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-b from-[#230735] to-[#17132E] border-2 border-[#E5007D] shadow-lg flex-shrink-0">
              {photoA ? (
                <img src={photoA} alt={nameA} className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-white text-xl">
                  {getPlayerInitials(nameA)}
                </div>
              )}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase text-[#E5007D] tracking-widest block">
                Rank #{playerA.rank || '-'} · {playerA.team}
              </span>
              <h3 className="font-display font-black text-2xl text-[#17132E] leading-tight">
                {nameA}
              </h3>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#E5007D]/10 border border-[#E5007D]/30 text-[#E5007D] font-black text-sm">
                <Award className="w-4 h-4" />
                <span>Score: {playerA.pressure_score.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* VS Centerpiece Badge */}
        <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E5007D] to-[#641078] text-white font-black text-sm flex items-center justify-center shadow-lg shadow-[#E5007D]/30 border-2 border-white">
            VS
          </div>
        </div>

        {/* Contender B Card */}
        <div className="md:col-span-5 bg-gradient-to-b from-white to-[#F7F4FC] rounded-3xl p-6 border-2 border-purple-400/50 shadow-rr-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#641078]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-b from-[#230735] to-[#17132E] border-2 border-[#641078] shadow-lg flex-shrink-0">
              {photoB ? (
                <img src={photoB} alt={nameB} className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-white text-xl">
                  {getPlayerInitials(nameB)}
                </div>
              )}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase text-[#641078] tracking-widest block">
                Rank #{playerB.rank || '-'} · {playerB.team}
              </span>
              <h3 className="font-display font-black text-2xl text-[#17132E] leading-tight">
                {nameB}
              </h3>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-100 border border-purple-300 text-[#641078] font-black text-sm">
                <Award className="w-4 h-4" />
                <span>Score: {playerB.pressure_score.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Head-to-Head Detailed Comparison Metrics */}
      <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-rr-card">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <h4 className="font-display font-black text-xl text-[#17132E] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#E5007D]" />
            Head-to-Head Metrics Breakdown
          </h4>
          <div className="text-xs font-bold text-gray-500">
            {winsA > winsB ? (
              <span className="text-[#E5007D] font-extrabold">{nameA} leads ({winsA} - {winsB})</span>
            ) : winsB > winsA ? (
              <span className="text-[#641078] font-extrabold">{nameB} leads ({winsB} - {winsA})</span>
            ) : (
              <span className="text-amber-600 font-extrabold">Evenly Matched ({winsA} - {winsB})</span>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {metrics.map((m, idx) => {
            const valA = Number(m.keyA) || 0;
            const valB = Number(m.keyB) || 0;
            const aWins = m.higherBetter ? valA > valB : valA < valB;
            const bWins = m.higherBetter ? valB > valA : valB < valA;
            const total = valA + valB;
            const pctA = total > 0 ? (valA / total) * 100 : 50;

            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#F7F4FC]/80 border border-purple-50">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className={`flex items-center gap-1.5 ${aWins ? 'text-[#E5007D] font-black' : 'text-gray-600'}`}>
                    {aWins && <CheckCircle className="w-3.5 h-3.5 text-[#E5007D]" />}
                    {m.prefix && valA > 0 ? m.prefix : ''}{valA.toFixed(2)} {m.unit}
                  </span>
                  
                  <span className="text-xs uppercase tracking-wider text-gray-700 font-extrabold">
                    {m.label}
                  </span>

                  <span className={`flex items-center gap-1.5 ${bWins ? 'text-[#641078] font-black' : 'text-gray-600'}`}>
                    {m.prefix && valB > 0 ? m.prefix : ''}{valB.toFixed(2)} {m.unit}
                    {bWins && <CheckCircle className="w-3.5 h-3.5 text-[#641078]" />}
                  </span>
                </div>

                {/* Progress bar comparison */}
                <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-[#E5007D] to-pink-400 transition-all duration-500" 
                    style={{ width: `${pctA}%` }} 
                  />
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-[#17132E] transition-all duration-500" 
                    style={{ width: `${100 - pctA}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
