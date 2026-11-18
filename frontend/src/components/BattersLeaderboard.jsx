import React, { useState, useMemo } from 'react';
import { Flame, Search, ArrowUpDown, ChevronDown, ChevronUp, Users, Award, Filter, Crown, Sparkles, TrendingUp } from 'lucide-react';
import { getPlayerPhoto, getPlayerInitials } from '../utils/playerPhotos';

export default function BattersLeaderboard({ top10Batters, allBatters, onComparePlayer }) {
  const [viewMode, setViewMode] = useState('top10'); // 'top10' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [sortField, setSortField] = useState('pressure_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);

  const rawList = viewMode === 'top10' ? top10Batters : allBatters;

  // Extract unique teams for filter pills
  const uniqueTeams = useMemo(() => {
    const teams = new Set(allBatters.map(b => b.team).filter(Boolean));
    return ['All', ...Array.from(teams).sort()];
  }, [allBatters]);

  // Filter and Sort logic
  const filteredBatters = useMemo(() => {
    return rawList
      .filter((b) => {
        const name = b.player_name || b.striker_name || '';
        const team = b.team || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || team.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTeam = selectedTeam === 'All' || team === selectedTeam;
        return matchesSearch && matchesTeam;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (typeof aVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
  }, [rawList, searchTerm, selectedTeam, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header and Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-purple-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5007D]/10 text-[#E5007D] text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-[#E5007D]" />
            <span>Batting Intelligence Leaderboard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-[#17132E] tracking-tight">
            TOP BATTERS UNDER <span className="text-[#E5007D]">PRESSURE</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Ranked by multi-dimensional clutch scoring: Strike Rate (SR<sub>P</sub>), Dismissal Resistance (Avg<sub>P</sub>), Boundary Power, and Career Baseline Elevation (ΔSR).
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-purple-100 self-start md:self-auto">
          <button
            onClick={() => { setViewMode('top10'); setSortField('pressure_score'); setSortOrder('desc'); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              viewMode === 'top10'
                ? 'bg-gradient-to-r from-[#E5007D] to-[#641078] text-white shadow-md shadow-[#E5007D]/20'
                : 'text-gray-600 hover:text-[#17132E]'
            }`}
          >
            Official Top 10
          </button>
          <button
            onClick={() => { setViewMode('all'); setSortField('pressure_score'); setSortOrder('desc'); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              viewMode === 'all'
                ? 'bg-gradient-to-r from-[#E5007D] to-[#641078] text-white shadow-md shadow-[#E5007D]/20'
                : 'text-gray-600 hover:text-[#17132E]'
            }`}
          >
            All 150 Qualified Batters
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batter by name or team (e.g. Babar, Jaiswal, Royals)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-purple-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5007D] shadow-sm font-medium"
          />
        </div>

        {/* Team Filter */}
        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-white border border-purple-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5007D] shadow-sm text-gray-700 font-medium"
          >
            {uniqueTeams.map((team) => (
              <option key={team} value={team}>
                Team: {team}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Stats Summary */}
        <div className="md:col-span-3 text-right text-xs font-semibold text-gray-500">
          Showing <span className="text-[#E5007D] font-bold">{filteredBatters.length}</span> of {rawList.length} qualified batters
        </div>
      </div>

      {/* Table & Cards */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-rr-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#17132E] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-4 text-center w-16">
                  <button onClick={() => handleSort('rank')} className="inline-flex items-center gap-1 hover:text-[#E5007D]">
                    Rank <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-4 px-4">
                  <button onClick={() => handleSort('player_name')} className="inline-flex items-center gap-1 hover:text-[#E5007D]">
                    Player & Team <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-4 px-4 text-right">
                  <button onClick={() => handleSort('pressure_score')} className="inline-flex items-center gap-1 hover:text-[#E5007D]">
                    Pressure Score <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-4 px-4 text-right">
                  <button onClick={() => handleSort('strike_rate')} className="inline-flex items-center gap-1 hover:text-[#E5007D]">
                    Pressure SR <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-4 px-4 text-right">
                  <button onClick={() => handleSort('average')} className="inline-flex items-center gap-1 hover:text-[#E5007D]">
                    Pressure Avg <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-4 px-4 text-right">
                  <button onClick={() => handleSort('delta_sr')} className="inline-flex items-center gap-1 hover:text-[#E5007D]">
                    Clutch ΔSR <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-4 px-4 text-right">
                  <button onClick={() => handleSort('boundary_percent')} className="inline-flex items-center gap-1 hover:text-[#E5007D]">
                    Boundary % <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-sm font-medium">
              {filteredBatters.map((batter, idx) => {
                const name = batter.player_name || batter.striker_name;
                const id = batter.player_id || batter.striker_id;
                const rank = batter.rank || (idx + 1);
                const score = batter.pressure_score;
                const sr = batter.strike_rate || batter.pressure_sr;
                const avg = batter.average || batter.pressure_avg;
                const delta = batter.delta_sr;
                const bp = batter.boundary_percent || batter.pressure_boundary_pct;
                const dots = batter.dot_percent || batter.pressure_dot_pct;
                const balls = batter.balls_faced || batter.pressure_balls_faced;
                const runs = batter.runs_scored || batter.pressure_runs;
                const isExpanded = expandedId === id;
                const photo = getPlayerPhoto(name);

                // Rank badge styling
                const rankBadgeClass = 
                  rank === 1 ? 'bg-gradient-to-br from-[#FDB913] to-amber-600 text-white shadow-md shadow-[#FDB913]/40' :
                  rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800' :
                  rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                  'bg-purple-50 text-purple-900 border border-purple-200';

                return (
                  <React.Fragment key={id}>
                    <tr className="hover:bg-purple-50/50 transition-colors group">
                      {/* Rank */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${rankBadgeClass}`}>
                          {rank === 1 ? '👑 1' : rank}
                        </span>
                      </td>

                      {/* Player Avatar, Name and Team */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-br from-[#230735] to-[#17132E] border-2 border-pink-500/30 flex-shrink-0 shadow-md group-hover:border-[#E5007D] transition-colors">
                            {photo ? (
                              <img src={photo} alt={name} className="w-full h-full object-cover object-top" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-xs text-[#E5007D]">
                                {getPlayerInitials(name)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#17132E] text-base group-hover:text-[#E5007D] transition-colors">
                                {name}
                              </span>
                              {batter.team?.includes('Royals') && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-pink-100 text-[#E5007D] border border-pink-200 uppercase">
                                  RR Star
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 font-medium inline-flex items-center gap-1.5 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E5007D]" />
                              {batter.team}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Pressure Score */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E5007D]/10 text-[#E5007D] font-extrabold text-sm border border-[#E5007D]/20">
                          <Award className="w-3.5 h-3.5" />
                          <span>{score.toFixed(2)}</span>
                        </div>
                      </td>

                      {/* Strike Rate */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-[#17132E]">{sr.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-400 block font-normal">runs/100b</span>
                      </td>

                      {/* Average */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-[#17132E]">{avg.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-400 block font-normal">runs/out</span>
                      </td>

                      {/* Delta SR */}
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-lg text-xs ${
                          delta >= 0 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                        </span>
                      </td>

                      {/* Boundary % */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-gray-700">{bp.toFixed(1)}%</span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onComparePlayer(batter, 'batter')}
                            title="Compare Player Head-to-Head"
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-[#E5007D] text-purple-900 hover:text-white transition-colors"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleExpand(id)}
                            title="View Analysis"
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-[#17132E] text-purple-900 hover:text-white transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Analytical Card with Player Spotlight */}
                    {isExpanded && (
                      <tr className="bg-purple-50/70 border-b border-purple-100">
                        <td colSpan="8" className="p-5">
                          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
                            
                            {/* Player Spotlight Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#17132E] border-2 border-pink-500 shadow-md">
                                  {photo ? (
                                    <img src={photo} alt={name} className="w-full h-full object-cover object-top" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center font-black text-white text-base">
                                      {getPlayerInitials(name)}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-display font-black text-2xl text-[#17132E]">{name}</span>
                                    <span className="text-xs px-3 py-1 rounded-full bg-[#17132E] text-white font-bold">{batter.team}</span>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-500 mt-1 block">
                                    Player ID: #{id} · Qualified Batter Under Pressure
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs px-3 py-1.5 rounded-full bg-[#E5007D] text-white font-black uppercase tracking-wider">
                                  Official Rank #{rank}
                                </span>
                                <button
                                  onClick={() => onComparePlayer(batter, 'batter')}
                                  className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-[#E5007D] text-purple-900 hover:text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                  Compare in Arena
                                </button>
                              </div>
                            </div>

                            {/* Full metrics grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                              <div className="bg-[#F7F4FC] p-3 rounded-2xl border border-purple-50">
                                <span className="text-[10px] text-gray-500 font-bold uppercase block">Pressure Balls</span>
                                <span className="text-base font-black text-[#17132E]">{balls?.toLocaleString()}</span>
                              </div>
                              <div className="bg-[#F7F4FC] p-3 rounded-2xl border border-purple-50">
                                <span className="text-[10px] text-gray-500 font-bold uppercase block">Pressure Runs</span>
                                <span className="text-base font-black text-[#17132E]">{runs?.toLocaleString()}</span>
                              </div>
                              <div className="bg-[#F7F4FC] p-3 rounded-2xl border border-purple-50">
                                <span className="text-[10px] text-gray-500 font-bold uppercase block">Baseline Career SR</span>
                                <span className="text-base font-black text-[#17132E]">{(batter.baseline_sr || 0).toFixed(1)}</span>
                              </div>
                              <div className="bg-[#F7F4FC] p-3 rounded-2xl border border-purple-50">
                                <span className="text-[10px] text-gray-500 font-bold uppercase block">Clutch Elevation</span>
                                <span className="text-base font-black text-emerald-600">+{delta.toFixed(1)} SR</span>
                              </div>
                              <div className="bg-[#F7F4FC] p-3 rounded-2xl border border-purple-50">
                                <span className="text-[10px] text-gray-500 font-bold uppercase block">Dot Ball %</span>
                                <span className="text-base font-black text-gray-700">{dots.toFixed(1)}%</span>
                              </div>
                              <div className="bg-pink-50 p-3 rounded-2xl border border-pink-200">
                                <span className="text-[10px] text-[#E5007D] font-bold uppercase block">Pressure Score</span>
                                <span className="text-base font-black text-[#E5007D]">{score.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Analytical Narrative */}
                            {batter.explanation && (
                              <div className="bg-gradient-to-r from-purple-50/70 to-pink-50/50 p-4 rounded-2xl border border-purple-100 text-xs text-gray-700 leading-relaxed flex items-start gap-3">
                                <Sparkles className="w-4 h-4 text-[#E5007D] shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-[#641078] block mb-0.5">Scouting Intelligence & Selection Rationale:</strong>
                                  {batter.explanation}
                                </div>
                              </div>
                            )}

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
