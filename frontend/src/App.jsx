import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BattersLeaderboard from './components/BattersLeaderboard';
import BowlersLeaderboard from './components/BowlersLeaderboard';
import PlayerComparison from './components/PlayerComparison';
import AnalyticsLab from './components/AnalyticsLab';
import UnstopPortal from './components/UnstopPortal';
import Footer from './components/Footer';

// Load verified platform data
import platformData from './data/platform_data.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [comparisonState, setComparisonState] = useState({
    playerA: null,
    playerB: null,
    type: 'batter'
  });

  const handleComparePlayer = (player, type) => {
    setComparisonState({
      playerA: player,
      playerB: null,
      type
    });
    setActiveTab('comparison');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4FC] text-[#17132E]">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
        {/* Overview Tab (Hero + Both Top 10 Overviews) */}
        {activeTab === 'overview' && (
          <>
            <Hero kpis={platformData.kpis} setActiveTab={setActiveTab} />
            <div className="space-y-4">
              <BattersLeaderboard 
                top10Batters={platformData.top_10_batters}
                allBatters={platformData.all_batters}
                onComparePlayer={handleComparePlayer}
              />
              <BowlersLeaderboard 
                top10Bowlers={platformData.top_10_bowlers}
                allBowlers={platformData.all_bowlers}
                onComparePlayer={handleComparePlayer}
              />
              <AnalyticsLab 
                kpis={platformData.kpis}
                top10Batters={platformData.top_10_batters}
                top10Bowlers={platformData.top_10_bowlers}
              />
              <UnstopPortal 
                top10Batters={platformData.top_10_batters}
                top10Bowlers={platformData.top_10_bowlers}
              />
            </div>
          </>
        )}

        {/* Batters Tab */}
        {activeTab === 'batters' && (
          <div className="pt-6">
            <BattersLeaderboard 
              top10Batters={platformData.top_10_batters}
              allBatters={platformData.all_batters}
              onComparePlayer={handleComparePlayer}
            />
          </div>
        )}

        {/* Bowlers Tab */}
        {activeTab === 'bowlers' && (
          <div className="pt-6">
            <BowlersLeaderboard 
              top10Bowlers={platformData.top_10_bowlers}
              allBowlers={platformData.all_bowlers}
              onComparePlayer={handleComparePlayer}
            />
          </div>
        )}

        {/* Head-to-Head Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="pt-6">
            <PlayerComparison 
              allBatters={platformData.all_batters}
              allBowlers={platformData.all_bowlers}
              initialPlayerA={comparisonState.playerA}
              initialPlayerB={comparisonState.playerB}
              initialType={comparisonState.type}
            />
          </div>
        )}

        {/* Analytics Lab Tab */}
        {activeTab === 'analytics' && (
          <div className="pt-6">
            <AnalyticsLab 
              kpis={platformData.kpis}
              top10Batters={platformData.top_10_batters}
              top10Bowlers={platformData.top_10_bowlers}
            />
          </div>
        )}

        {/* Unstop Portal Tab */}
        {activeTab === 'unstop' && (
          <div className="pt-6">
            <UnstopPortal 
              top10Batters={platformData.top_10_batters}
              top10Bowlers={platformData.top_10_bowlers}
            />
          </div>
        )}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
