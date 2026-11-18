import React from 'react';
import { Crown, Sparkles, ExternalLink } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-[#17132E] text-white border-t border-purple-900/40 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Official Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="relative w-12 h-14 flex items-center justify-center p-1 bg-gradient-to-b from-[#230735] to-[#17132E] rounded-xl border border-pink-500/40 shadow-lg shadow-[#E5007D]/20">
                <img 
                  src="/images/rr/rr-logo.svg" 
                  alt="Rajasthan Royals Crest" 
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(229,0,125,0.5)]"
                />
              </div>
              <div>
                <span className="font-display font-black text-2xl tracking-tight text-white block">
                  SUPERR <span className="text-[#E5007D]">SELECTOR</span>
                </span>
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#FDB913]">
                  HALLA BOL 👑
                </span>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Official cricket intelligence and player selection platform built for the SupeRR Selector Season 2 hackathon. Measuring clutch performance under high pressure across 200,999 delivery-level records.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-pink-300 font-bold uppercase tracking-wider">
              <Crown className="w-4 h-4 text-[#FDB913]" />
              <span>Rajasthan Royals Visual Identity & Intelligence Architecture</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#FDB913] mb-4">
              Intelligence Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400 font-semibold">
              <li>
                <button onClick={() => { setActiveTab('batters'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                  Top 10 Batters Under Pressure
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('bowlers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                  Top 10 Bowlers Under Pressure
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('comparison'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                  Head-to-Head Battle Arena
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('analytics'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                  Analytics & Visualizations Lab
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('unstop'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[#E5007D] hover:text-white transition-colors">
                  Unstop Submission Checklist
                </button>
              </li>
            </ul>
          </div>

          {/* Challenge Standards */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-[#E5007D] mb-4">
              Statistical Standards
            </h4>
            <ul className="space-y-2 text-xs text-gray-400 leading-relaxed font-medium">
              <li>• Decoupled 1st-Innings from RRR</li>
              <li>• Chasing Pressure & Collapse Recovery</li>
              <li>• Clutch Delta vs. Career Baseline</li>
              <li>• Bayesian Shrinkage (K = 100 Balls)</li>
              <li>• 100% Reproducible & Data-Driven</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <div>
            © 2026 SupeRR Selector Season 2 · Round 1 Submission. All data grounded in official project datasets.
          </div>
          <div className="flex items-center gap-1.5 text-gray-300">
            <span>Official design language inspired by</span>
            <span className="text-[#E5007D] font-extrabold uppercase tracking-wider">Rajasthan Royals</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
