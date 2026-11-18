import React, { useState, useEffect } from 'react';
import { Flame, Trophy, TrendingUp, Target, Award, ArrowRight, ShieldCheck, Zap, ChevronLeft, ChevronRight, Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero({ kpis, setActiveTab }) {
  // Slides featuring authentic Rajasthan Royals player photography (IPL 2027 Roster)
  const slides = [
    {
      id: 'shami',
      player: 'Mohammed Shami',
      role: 'Royals Pace Spearhead & Seam Master',
      badge: 'MARQUEE SEAM MASTER · RAJASTHAN ROYALS',
      title: 'ROYALS MARQUEE SEAM MASTERCLASS',
      description: 'Premier India fast bowler joins the Rajasthan Royals arsenal for IPL 2027. Master of early powerplay strikes and lethal yorkers under extreme death-overs pressure.',
      bgImage: '/images/rr/shami-hero.png',
      cutoutImage: '/images/rr/players/mohammed-shami.png',
      stat1: { label: 'Pressure Balls', val: '436' },
      stat2: { label: 'Pressure Wkts', val: '33' },
      stat3: { label: 'Total Wkts', val: '69' },
      accent: '#FDB913',
    },
    {
      id: 'vaibhav',
      player: 'Vaibhav Sooryavanshi',
      role: 'Top-Order Power Prodigy',
      badge: 'ROYALS ROSTER · RECORD BREAKING PHENOM',
      title: 'THE RECORD-BREAKING ROYAL PRODIGY',
      description: 'Youngest sensation in T20 history. Scouted & verified by SupeRR Selector\'s high-pressure scoring model for fearless boundary strike rate and unyielding intent.',
      bgImage: '/images/rr/vaibhav-hero.jpg',
      cutoutImage: '/images/rr/vaibhav-cutout.png',
      stat1: { label: 'Age', val: '14 Yrs' },
      stat2: { label: 'Scouting Verdict', val: 'Elite Intent' },
      stat3: { label: 'Boundary Power', val: 'Fearless' },
      accent: '#E5007D',
    },
    {
      id: 'jaiswal',
      player: 'Yashasvi Jaiswal',
      role: 'Official Top 10 Batter #10',
      badge: 'SUPERR SELECTOR RANK #10 · ROYALS OPENER',
      title: 'THE ROYALS FEARLESS FINISHER',
      description: 'Official SupeRR Selector Rank #10 Batter Under Pressure. Demonstrated an astounding +28.16 Strike Rate clutch elevation in high-stakes T20 encounters.',
      bgImage: '/images/rr/vaibhav-hero.jpg',
      cutoutImage: '/images/rr/players/yashasvi-jaiswal.png',
      stat1: { label: 'Pressure Score', val: '71.03' },
      stat2: { label: 'Pressure SR', val: '179.35' },
      stat3: { label: 'Clutch Elevation', val: '+28.16 SR' },
      accent: '#E5007D',
    },
    {
      id: 'parag',
      player: 'Riyan Parag',
      role: 'Royals Middle-Order Enforcer & Finisher',
      badge: 'ROYALS CORE · POWER HITTER ⚡',
      title: 'THE ROYALS CLUTCH ENFORCER',
      description: 'Proven match-winner anchoring high-pressure chases and elevating strike rates when the required run rate spikes in high-stakes IPL encounters.',
      bgImage: '/images/rr/shami-hero.png',
      cutoutImage: '/images/rr/players/riyan-parag.png',
      stat1: { label: 'Pressure Intent', val: 'Aggressive' },
      stat2: { label: 'Clutch Impact', val: 'Elite Finisher' },
      stat3: { label: 'Roster Role', val: 'Middle Order' },
      accent: '#641078',
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const active = slides[currentSlide];

  // 5 Redesigned Clean Analytics Dashboard Cards
  const stats = [
    { label: 'Matches Analysed', value: kpis.total_matches.toLocaleString(), sub: 'IPL & T20I (2022-26)', icon: Target },
    { label: 'Deliveries Tracked', value: kpis.total_deliveries.toLocaleString(), sub: 'Ball-by-Ball Tracking', icon: Zap },
    { label: 'Qualified Batters', value: kpis.qualified_batters, sub: 'Min 150 Pressure Balls', icon: Flame },
    { label: 'Qualified Bowlers', value: kpis.qualified_bowlers, sub: 'Min 150 Pressure Balls', icon: Trophy },
    { label: 'High Pressure Balls', value: `${kpis.high_pressure_pct}%`, sub: 'Pressure Index ≥ 0.60', icon: TrendingUp },
  ];

  return (
    <div className="relative bg-[#17132E] text-white overflow-hidden">
      
      {/* =========================================================================
          HERO CAROUSEL: Large Player Photography & Dark Purple Gradient Overlays
          ========================================================================= */}
      <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center border-b border-purple-900/60 overflow-hidden">
        
        {/* Background genuine action photo with dark purple gradient vignette */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id + '-bg'}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.38, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center filter saturate-150"
            style={{ backgroundImage: `url(${active.bgImage})` }}
          />
        </AnimatePresence>

        {/* Multi-layered dark royal purple & navy gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#17132E] via-[#230735]/95 to-[#17132E]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17132E] via-transparent to-[#17132E]/60" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#E5007D]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#641078]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 z-10">
              
              {/* Badge */}
              <motion.div 
                key={active.id + '-badge'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#E5007D]/30 to-[#641078]/40 border border-[#E5007D]/50 text-xs font-black tracking-wider text-white shadow-lg shadow-[#E5007D]/20 uppercase mb-4"
              >
                <Crown className="w-3.5 h-3.5 text-yellow-300" />
                <span>{active.badge}</span>
              </motion.div>

              {/* Main Headline */}
              <motion.div
                key={active.id + '-headline'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3 className="text-[#E5007D] font-extrabold text-sm sm:text-base tracking-widest uppercase mb-1">
                  CRICKET INTELLIGENCE & PLAYER SELECTION PLATFORM
                </h3>
                <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-white uppercase drop-shadow-md">
                  SUPERR <span className="text-[#E5007D]">SELECTOR</span>
                  <span className="block text-xl sm:text-3xl lg:text-4xl text-gray-100 font-extrabold mt-1">
                    SELECT YOUR CHAMPIONS
                  </span>
                </h1>
                
                {/* Featured Player Headline */}
                <div className="mt-4 pt-4 border-t border-purple-800/40">
                  <h4 className="text-xl sm:text-2xl font-black font-display text-white flex items-center gap-2">
                    <span>{active.player}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 text-pink-300 border border-white/15">
                      {active.role}
                    </span>
                  </h4>
                  <p className="mt-2 text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl font-normal">
                    {active.description}
                  </p>
                </div>

                {/* Player Spotlight KPI Pills */}
                <div className="mt-5 grid grid-cols-3 gap-3 max-w-lg">
                  <div className="bg-[#230735]/80 backdrop-blur-md p-3 rounded-2xl border border-pink-500/30">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">{active.stat1.label}</span>
                    <span className="text-base sm:text-lg font-black text-white">{active.stat1.val}</span>
                  </div>
                  <div className="bg-[#230735]/80 backdrop-blur-md p-3 rounded-2xl border border-pink-500/30">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">{active.stat2.label}</span>
                    <span className="text-base sm:text-lg font-black text-[#E5007D]">{active.stat2.val}</span>
                  </div>
                  <div className="bg-[#230735]/80 backdrop-blur-md p-3 rounded-2xl border border-pink-500/30">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">{active.stat3.label}</span>
                    <span className="text-base sm:text-lg font-black text-amber-300">{active.stat3.val}</span>
                  </div>
                </div>

                {/* Primary Platform CTAs */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('batters')}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#E5007D] to-[#641078] hover:from-[#c9006e] hover:to-[#500c60] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-[#E5007D]/30 hover:scale-105 transition-all duration-200"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Explore Top 10 Batters</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab('bowlers')}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-black text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md hover:scale-105 transition-all duration-200"
                  >
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span>Explore Top 10 Bowlers</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('unstop')}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-pink-500/20 hover:from-amber-500/30 hover:to-pink-500/30 text-amber-200 border border-amber-400/40 font-bold text-xs uppercase tracking-wider transition-all duration-200"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Unstop Checklist</span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Large Player Photography with Glow & Cutout */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id + '-photo'}
                  initial={{ opacity: 0, scale: 0.9, x: 30 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -30 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden border-2 border-pink-500/40 bg-gradient-to-b from-[#230735] to-[#17132E] shadow-2xl shadow-[#E5007D]/25 group"
                >
                  {/* Background Action Photo */}
                  <img
                    src={active.bgImage}
                    alt={active.player}
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-35 filter blur-[1px] group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Radial spotlight glow behind cutout */}
                  <div className="absolute inset-0 bg-radial-glow opacity-80" />

                  {/* Genuine Player Cutout / Portrait */}
                  <img
                    src={active.cutoutImage}
                    alt={active.player}
                    className="relative z-10 w-full h-full object-contain object-bottom filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                  />

                  {/* Bottom Vignette with Player Badge */}
                  <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-[#17132E] via-[#17132E]/90 to-transparent z-20">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-black uppercase text-[#E5007D] tracking-widest block">
                          Rajasthan Royals Roster
                        </span>
                        <h5 className="font-display font-black text-xl text-white">
                          {active.player}
                        </h5>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#E5007D]/20 border border-[#E5007D]/50 flex items-center justify-center p-1.5">
                        <img src="/images/rr/rr-logo.svg" alt="RR" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Carousel Previous / Next Controls */}
              <div className="absolute -bottom-5 right-4 z-30 flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full bg-[#230735]/90 hover:bg-[#E5007D] border border-pink-500/40 text-white flex items-center justify-center shadow-lg transition-colors"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#17132E]/80 border border-white/10 text-xs font-bold">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentSlide ? 'w-6 bg-[#E5007D]' : 'w-2 bg-white/30'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full bg-[#230735]/90 hover:bg-[#E5007D] border border-pink-500/40 text-white flex items-center justify-center shadow-lg transition-colors"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: ANALYTICS DASHBOARD STATISTICS CARDS
          Clean white/light-grey cards with subtle shadows, pink icons & purple accents
          ========================================================================= */}
      <section className="bg-[#F7F4FC] py-10 px-4 sm:px-6 lg:px-8 border-b border-purple-100">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-[#E5007D] font-extrabold text-xs uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>Verified Match Intelligence Database</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-[#17132E] tracking-tight mt-0.5">
                EXECUTIVE ANALYTICS OVERVIEW
              </h2>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-purple-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              200,999 Balls Parsed
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx}
                  className="relative overflow-hidden rounded-3xl bg-white border border-purple-100 p-5 shadow-rr-card hover:shadow-rr-hover hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-gray-500 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">{stat.label}</span>
                    <div className="w-8 h-8 rounded-xl bg-pink-50 group-hover:bg-[#E5007D] text-[#E5007D] group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black font-display text-[#17132E] tracking-tight group-hover:text-[#E5007D] transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 font-semibold">
                      {stat.sub}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E5007D] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
