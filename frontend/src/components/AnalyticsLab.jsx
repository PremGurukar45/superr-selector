import React, { useState } from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Award, Image as ImageIcon, Eye, Download, X, HelpCircle } from 'lucide-react';

export default function AnalyticsLab({ kpis, top10Batters, top10Bowlers }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const charts = [
    {
      id: 'batters_top10',
      title: 'Top 10 Batters Multi-Metric Dashboard',
      description: 'Comprehensive 4-panel dashboard showing Pressure Scores, Strike Rates, Batting Averages, and Boundary vs Dot Ball contributions.',
      filename: 'batters_top10_comparison.png',
      badge: 'Batting Focus'
    },
    {
      id: 'bowlers_top10',
      title: 'Top 10 Bowlers Multi-Metric Dashboard',
      description: 'Defensive suppression analysis comparing Economy Rates, Clutch Economy Deltas, Wickets taken under pressure, and Dot Ball %.',
      filename: 'bowlers_top10_comparison.png',
      badge: 'Bowling Focus'
    },
    {
      id: 'batting_clutch',
      title: 'Batting Clutch Elevation (Usual vs Pressure SR)',
      description: 'Scatter plot of all qualified batters mapping baseline strike rate against pressure strike rate, highlighting the Clutch Elevation Zone.',
      filename: 'batting_pressure_vs_baseline.png',
      badge: 'Scatter & Quadrants'
    },
    {
      id: 'bowling_clutch',
      title: 'Bowling Economy Suppression (Baseline vs Pressure Econ)',
      description: 'Scatter plot identifying elite bowlers whose economy tightens below career baseline when match pressure escalates.',
      filename: 'bowling_pressure_vs_baseline.png',
      badge: 'Defensive Quadrant'
    },
    {
      id: 'stage_distribution',
      title: 'Pressure Context & Delivery Distribution',
      description: 'Statistical breakdown of deliveries categorized into Low, Medium, and High Pressure across Match Stages and Innings 1 vs 2.',
      filename: 'pressure_distribution_by_stage.png',
      badge: 'Context Modeling'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="pb-6 border-b border-purple-100">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#641078]/10 text-[#641078] text-xs font-bold uppercase tracking-wider mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Cricket Data Science & Intelligence Lab</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-[#17132E] tracking-tight">
          ANALYTICS <span className="text-[#641078]">& DATA VISUALIZATION</span>
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mt-1 max-w-3xl">
          Visual evidence and empirical validation supporting the SupeRR Selector pressure models, featuring high-resolution publication charts generated directly from the 200,999 delivery dataset.
        </p>
      </div>

      {/* Interactive Contextual Signals Cards */}
      <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-rr-card">
          <div className="flex items-center gap-2 text-[#E5007D] font-bold text-xs uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>2nd Innings Chasing</span>
          </div>
          <div className="text-3xl font-black font-display text-[#17132E]">
            {kpis.inn2_hp_pct}%
          </div>
          <p className="text-xs text-gray-500 font-semibold mt-1">High Pressure Deliveries in Chases</p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
            Driven by dynamic Required Run Rate ($RRR \ge 10.0$), balls remaining, and wicket depletion. Surges to <strong>{kpis.inn2_death_hp_pct}%</strong> in death overs (overs 16–20).
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-rr-card">
          <div className="flex items-center gap-2 text-[#641078] font-bold text-xs uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>1st Innings Defending</span>
          </div>
          <div className="text-3xl font-black font-display text-[#17132E]">
            {kpis.inn1_hp_pct}%
          </div>
          <p className="text-xs text-gray-500 font-semibold mt-1">High Pressure Deliveries in Target-Setting</p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
            Strictly avoids RRR (per official guidelines). Governed by death-overs leverage (overs 16–20) and top-order collapse recovery (≥ 3 wickets lost in powerplay).
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-rr-card">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            <span>Bayesian Shrinkage</span>
          </div>
          <div className="text-3xl font-black font-display text-[#17132E]">
            K = 100 Balls
          </div>
          <p className="text-xs text-gray-500 font-semibold mt-1">Empirical Bayes Confidence Weight</p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600 leading-relaxed">
            Confidence(N) = N / (N + 100). Blends individual performance with population mean μ to eliminate small-sample noise and reward sustained excellence.
          </div>
        </div>
      </div>

      {/* High-Resolution Publication Charts Gallery */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-display font-black text-[#17132E]">
              Publication Charts Gallery
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Generated by Matplotlib & Seaborn at 300 DPI. Click any chart to open in high-resolution preview.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charts.map((c) => (
            <div 
              key={c.id}
              className="bg-white rounded-3xl border border-purple-100 shadow-rr-card overflow-hidden hover:shadow-rr-hover transition-all duration-300 group flex flex-col"
            >
              <div className="relative overflow-hidden bg-gray-50 h-52 border-b border-purple-100 cursor-pointer" onClick={() => setSelectedImage(c)}>
                <img 
                  src={`/charts/${c.filename}`} 
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-[#17132E]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 rounded-xl bg-white text-[#17132E] text-xs font-bold shadow-lg flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#E5007D]" />
                    <span>View High-Res</span>
                  </span>
                </div>
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#17132E]/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                  {c.badge}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-base text-[#17132E] group-hover:text-[#E5007D] transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    {c.description}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedImage(c)}
                    className="text-xs font-bold text-[#E5007D] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Inspect Full Size</span>
                  </button>
                  <a 
                    href={`/charts/${c.filename}`} 
                    download
                    className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#17132E] transition-colors"
                    title="Download Chart"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="p-4 sm:p-5 bg-[#17132E] text-white flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-base sm:text-lg">{selectedImage.title}</h4>
                <p className="text-xs text-gray-400">{selectedImage.description}</p>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-gray-50">
              <img 
                src={`/charts/${selectedImage.filename}`} 
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-md"
              />
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-semibold">High-Resolution 300 DPI Publication Export</span>
              <a 
                href={`/charts/${selectedImage.filename}`} 
                download
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E5007D] to-[#641078] text-white font-bold hover:scale-105 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
