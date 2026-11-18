import React, { useState } from 'react';
import { Flame, Trophy, Users, BarChart3, FileText, Menu, X, Crown, Sparkles, ChevronRight } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Crown },
    { id: 'batters', label: 'Top Batters', icon: Flame },
    { id: 'bowlers', label: 'Top Bowlers', icon: Trophy },
    { id: 'comparison', label: 'Head-to-Head', icon: Users },
    { id: 'analytics', label: 'Analytics Lab', icon: BarChart3 },
    { id: 'unstop', label: 'Unstop Submission', icon: FileText, highlight: true },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 text-white shadow-2xl font-sans">
      {/* 1. Official RR Upper Pink Strip */}
      <div className="bg-gradient-to-r from-[#E5007D] via-[#ED1D90] to-[#E5007D] text-white text-[11px] sm:text-xs font-bold uppercase tracking-widest px-4 py-1.5 border-b border-pink-400/30 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block animate-pulse">👑</span>
            <span className="tracking-wider">RAJASTHAN ROYALS OFFICIAL SELECTION ENGINE</span>
            <span className="hidden sm:inline-block text-pink-200">·</span>
            <span className="hidden sm:inline-block font-extrabold text-amber-200">HALLA BOL</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-semibold text-white/90">
            <span className="hidden md:inline-flex items-center gap-1 bg-black/20 px-2.5 py-0.5 rounded-full border border-white/20">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              Round 1 Verified Intelligence
            </span>
            <span className="text-white font-black bg-white/20 px-2 py-0.5 rounded-md tracking-wider">
              IPL & T20I
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary Dark Purple & Navy Navigation Bar */}
      <div className="bg-[#17132E]/95 backdrop-blur-md border-b border-purple-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Authentic Rajasthan Royals Crest & Brand Branding */}
            <div 
              onClick={() => handleNavClick('overview')}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              {/* Authentic RR Official Crest SVG Logo */}
              <div className="relative w-12 h-14 flex items-center justify-center p-1 bg-gradient-to-b from-[#230735] to-[#17132E] rounded-xl border border-pink-500/30 shadow-lg shadow-[#E5007D]/20 group-hover:scale-105 group-hover:border-[#E5007D] transition-all duration-300">
                <img 
                  src="/images/rr/rr-logo.svg" 
                  alt="Rajasthan Royals Crest" 
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(229,0,125,0.5)]"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-white uppercase group-hover:text-pink-100 transition-colors">
                    SUPERR <span className="text-[#E5007D] drop-shadow-[0_0_12px_rgba(229,0,125,0.6)]">SELECTOR</span>
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-[#E5007D] to-[#641078] text-white shadow-sm border border-pink-400/40">
                    S2
                  </span>
                </div>
                <p className="text-[11px] font-semibold tracking-wider text-pink-200/80 uppercase flex items-center gap-1.5">
                  <span>Rajasthan Royals</span>
                  <span className="w-1 h-1 rounded-full bg-[#E5007D]"></span>
                  <span className="text-gray-400">Cricket Intelligence</span>
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#E5007D] to-[#641078] text-white shadow-lg shadow-[#E5007D]/30 border border-pink-400/40'
                        : item.highlight
                        ? 'bg-[#E5007D]/15 text-pink-300 border border-[#E5007D]/40 hover:bg-[#E5007D] hover:text-white shadow-sm'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-[#E5007D]' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile menu trigger */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-purple-800/40"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-[#E5007D]" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#17132E] border-b border-purple-900/60 px-4 pt-3 pb-6 space-y-2 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E5007D] to-[#641078] text-white shadow-md'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#E5007D]'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
