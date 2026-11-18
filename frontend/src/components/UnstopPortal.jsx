import React, { useState } from 'react';
import { Award, CheckCircle2, Copy, Check, Download, FileText, ExternalLink, Sparkles, AlertCircle, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPlayerPhoto, getPlayerInitials } from '../utils/playerPhotos';

export default function UnstopPortal({ top10Batters, top10Bowlers }) {
  const [checkedBatters, setCheckedBatters] = useState({});
  const [checkedBowlers, setCheckedBowlers] = useState({});
  const [copiedBatters, setCopiedBatters] = useState(false);
  const [copiedBowlers, setCopiedBowlers] = useState(false);

  const toggleBatterCheck = (rank) => {
    const updated = { ...checkedBatters, [rank]: !checkedBatters[rank] };
    setCheckedBatters(updated);
    if (Object.keys(updated).filter(k => updated[k]).length === 10) {
      triggerConfetti();
    }
  };

  const toggleBowlerCheck = (rank) => {
    const updated = { ...checkedBowlers, [rank]: !checkedBowlers[rank] };
    setCheckedBowlers(updated);
    if (Object.keys(updated).filter(k => updated[k]).length === 10) {
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#E5007D', '#641078', '#FDB913', '#17132E']
    });
  };

  const copyBattersList = () => {
    const text = top10Batters.map(b => `${b.rank}. ${b.player_name}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBatters(true);
    setTimeout(() => setCopiedBatters(false), 2000);
  };

  const copyBowlersList = () => {
    const text = top10Bowlers.map(b => `${b.rank}. ${b.player_name}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBowlers(true);
    setTimeout(() => setCopiedBowlers(false), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="pb-6 border-b border-purple-100">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5007D]/10 text-[#E5007D] text-xs font-bold uppercase tracking-wider mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>Official Submission Portal</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-[#17132E] tracking-tight">
          UNSTOP SUBMISSION <span className="text-[#E5007D]">CHECKLIST</span>
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mt-1 max-w-3xl">
          Everything required to submit Round 1 of SupeRR Selector Season 2 on Unstop: exact dropdown player selections (Rank 1 through 10) and your official Methodology Report.
        </p>
      </div>

      {/* Instructions Banner */}
      <div className="my-8 bg-gradient-to-br from-[#17132E] via-[#230735] to-[#17132E] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-purple-800/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E5007D]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-bold text-[#FDB913] uppercase tracking-wider block mb-1">
              Submission Requirements (Round 1)
            </span>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white">
              Two Required Components
            </h3>
            <p className="text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed font-normal">
              1. <strong>Player Rankings</strong>: Select the top 10 batters and top 10 bowlers using the dropdown fields on Unstop.<br />
              2. <strong>Methodology Report</strong>: Upload your technical documentation explaining your pressure definition, metrics, and fair comparisons.
            </p>
          </div>
          <button
            onClick={triggerConfetti}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#E5007D] to-[#641078] hover:scale-105 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg transition-transform flex items-center gap-2 shrink-0 border border-pink-400/40"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Celebrate Completion!</span>
          </button>
        </div>
      </div>

      {/* Grid of Two Dropdown Checklists with Player Photography */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
        
        {/* Batters Selection */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-rr-card overflow-hidden">
          <div className="p-6 bg-[#17132E] text-white flex items-center justify-between border-b border-pink-500/20">
            <div>
              <span className="text-xs text-[#E5007D] font-black uppercase tracking-wider block">Component 01A</span>
              <h4 className="font-display font-black text-xl text-white mt-0.5">Top 10 Batters Dropdown</h4>
            </div>
            <button
              onClick={copyBattersList}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors border border-white/15"
            >
              {copiedBatters ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedBatters ? 'Copied!' : 'Copy List'}</span>
            </button>
          </div>

          <div className="p-6 divide-y divide-gray-100">
            {top10Batters.map((b) => {
              const isChecked = !!checkedBatters[b.rank];
              const photo = getPlayerPhoto(b.player_name);
              return (
                <div 
                  key={b.rank}
                  onClick={() => toggleBatterCheck(b.rank)}
                  className={`py-3.5 px-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    isChecked ? 'bg-emerald-50/70 border border-emerald-200' : 'hover:bg-purple-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#17132E] text-white font-black text-xs flex items-center justify-center shrink-0">
                      {b.rank}
                    </span>

                    {/* Photo thumbnail */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-[#230735] to-[#17132E] border border-pink-500/30 shrink-0">
                      {photo ? (
                        <img src={photo} alt={b.player_name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-black text-white">
                          {getPlayerInitials(b.player_name)}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className={`text-sm font-bold block ${isChecked ? 'line-through text-gray-400' : 'text-[#17132E]'}`}>
                        {b.player_name}
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        {b.team} · Score: <strong>{b.pressure_score.toFixed(1)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#E5007D] bg-[#E5007D]/10 px-2 py-0.5 rounded-md">
                      SR {b.strike_rate.toFixed(1)}
                    </span>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bowlers Selection */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-rr-card overflow-hidden">
          <div className="p-6 bg-[#17132E] text-white flex items-center justify-between border-b border-purple-500/20">
            <div>
              <span className="text-xs text-[#FDB913] font-black uppercase tracking-wider block">Component 01B</span>
              <h4 className="font-display font-black text-xl text-white mt-0.5">Top 10 Bowlers Dropdown</h4>
            </div>
            <button
              onClick={copyBowlersList}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors border border-white/15"
            >
              {copiedBowlers ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedBowlers ? 'Copied!' : 'Copy List'}</span>
            </button>
          </div>

          <div className="p-6 divide-y divide-gray-100">
            {top10Bowlers.map((b) => {
              const isChecked = !!checkedBowlers[b.rank];
              const photo = getPlayerPhoto(b.player_name);
              return (
                <div 
                  key={b.rank}
                  onClick={() => toggleBowlerCheck(b.rank)}
                  className={`py-3.5 px-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    isChecked ? 'bg-emerald-50/70 border border-emerald-200' : 'hover:bg-purple-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#17132E] text-white font-black text-xs flex items-center justify-center shrink-0">
                      {b.rank}
                    </span>

                    {/* Photo thumbnail */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-[#230735] to-[#17132E] border border-purple-500/30 shrink-0">
                      {photo ? (
                        <img src={photo} alt={b.player_name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-black text-white">
                          {getPlayerInitials(b.player_name)}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className={`text-sm font-bold block ${isChecked ? 'line-through text-gray-400' : 'text-[#17132E]'}`}>
                        {b.player_name}
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        {b.team} · Score: <strong>{b.pressure_score.toFixed(1)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#641078] bg-purple-100 px-2 py-0.5 rounded-md">
                      Econ {b.economy_rate.toFixed(2)}
                    </span>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Component 02: Report & CSV Downloads */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-rr-card">
        <div className="flex items-center gap-2 text-[#E5007D] font-bold text-xs uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Component 02 — Document Upload & Artifacts</span>
        </div>
        <h3 className="font-display font-black text-2xl text-[#17132E]">
          Download Official Deliverables
        </h3>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl font-normal">
          Upload your methodology report to the Unstop document upload field. All required files are verified, formatted, and ready for download:
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#641078] uppercase block">Official Report</span>
              <h5 className="font-bold text-sm text-[#17132E] mt-1">METHODOLOGY_REPORT.md</h5>
              <p className="text-xs text-gray-500 mt-1">286 lines · 12 complete sections</p>
            </div>
            <a 
              href="/reports/METHODOLOGY_REPORT.md"
              target="_blank"
              rel="noreferrer"
              className="mt-4 px-3 py-2 rounded-xl bg-[#17132E] hover:bg-[#641078] text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Report File</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#E5007D] uppercase block">Batters CSV</span>
              <h5 className="font-bold text-sm text-[#17132E] mt-1">top_10_batters_under_pressure.csv</h5>
              <p className="text-xs text-gray-500 mt-1">Full metrics & analytical rationale</p>
            </div>
            <a 
              href="/output/top_10_batters_under_pressure.csv"
              target="_blank"
              rel="noreferrer"
              className="mt-4 px-3 py-2 rounded-xl bg-[#E5007D] hover:bg-[#c9006e] text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Batters CSV</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#641078] uppercase block">Bowlers CSV</span>
              <h5 className="font-bold text-sm text-[#17132E] mt-1">top_10_bowlers_under_pressure.csv</h5>
              <p className="text-xs text-gray-500 mt-1">Full metrics & analytical rationale</p>
            </div>
            <a 
              href="/output/top_10_bowlers_under_pressure.csv"
              target="_blank"
              rel="noreferrer"
              className="mt-4 px-3 py-2 rounded-xl bg-[#641078] hover:bg-[#500c60] text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Bowlers CSV</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
