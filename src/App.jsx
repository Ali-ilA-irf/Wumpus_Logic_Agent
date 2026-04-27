/**
 * src/App.jsx
 *
 * Root app shell with full navigation, controls, metrics, and logging.
 * Integrates all game systems: AI, KB, UI, and win/lose detection.
 */

import { useState, useEffect } from 'react';
import SetupPanel from './components/SetupPanel';
import GridRenderer from './components/GridRenderer';
import KBPanel from './components/KBPanel';
import ControlPanel from './components/ControlPanel';
import MetricsDashboard from './components/MetricsDashboard';
import PerceptLogPanel from './components/PerceptLogPanel';
import { useWumpusGame } from './hooks/useWumpusGame';

export default function App() {
  const {
    grid, agentPos, config, kb, lastPercepts,
    gameStatus, moveCount, moveHistory, totalInferenceSteps,
    newGame, playWinnableGame, moveAgent, agentStep, resetGame,
  } = useWumpusGame(4, 4);

  const [autoRunning, setAutoRunning] = useState(false);
  const [showOverlay, setShowOverlay] = useState(null);

  const { rows, cols } = config;
  const { row, col } = agentPos;

  // Handle win/lose detection with overlay
  useEffect(() => {
    if (gameStatus === 'dead') {
      setShowOverlay('dead');
    } else if (gameStatus === 'won') {
      setShowOverlay('won');
    } else if (gameStatus === 'stuck') {
      setShowOverlay('stuck');
    } else {
      setShowOverlay(null);
    }
  }, [gameStatus]);

  // Handler for step button
  const handleStep = () => {
    agentStep();
  };

  // Handler for reset
  const handleReset = () => {
    resetGame();
    setShowOverlay(null);
  };

  // Handler for new game
  const handleNewGame = (newRows, newCols) => {
    newGame(newRows, newCols);
    setAutoRunning(false);
    setShowOverlay(null);
  };

  const handleWinnableGame = (newRows, newCols) => {
    playWinnableGame(newRows, newCols);
    setAutoRunning(false);
    setShowOverlay(null);
  };

  return (
    <>
      <div className="scanlines" aria-hidden="true" />

      <div className="min-h-screen w-full flex flex-col" style={{ background: 'var(--void-900)' }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="w-full border-b border-black/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xl font-bold"
              style={{
                background: 'linear-gradient(135deg,rgba(0,245,255,0.15),rgba(191,95,255,0.15))',
                border:     '1px solid rgba(0,245,255,0.3)',
                boxShadow:  '0 0 12px rgba(0,245,255,0.2)',
                color:      'var(--neon-cyan)',
              }}
              aria-hidden="true"
            >◈</div>
            <div>
              <h1
                className="text-base font-bold leading-none text-glow-cyan"
                style={{ color: 'var(--neon-cyan)', fontFamily: "'JetBrains Mono',monospace" }}
              >
                Wumpus World
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 leading-none">
                Logic-Based Agent Simulator — Resolution Engine v2
              </p>
            </div>
          </div>

          {/* Agent position + KB clause count */}
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-mono px-2.5 py-1.5 rounded-lg"
              style={{ background: 'rgba(191,95,255,0.08)', border: '1px solid rgba(191,95,255,0.2)', color: 'var(--neon-purple)' }}
            >
              KB: {kb.length} clauses
            </span>
            <div
              className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)', color: 'var(--neon-cyan)' }}
            >
              <span style={{ opacity: 0.6 }}>AGENT @</span>
              <span className="text-glow-cyan font-semibold">({row}, {col})</span>
            </div>
          </div>
        </header>

        {/* ── Main ───────────────────────────────────────────── */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-center min-h-0">

          {/* Left sidebar - Game controls */}
          <aside className="w-full lg:w-[22rem] flex flex-col gap-4 shrink-0 max-h-[calc(100vh-200px)] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

            <SetupPanel
              currentRows={rows}
              currentCols={cols}
              onNewGame={handleNewGame}
              onWinnableGame={handleWinnableGame}
            />

            {/* Control panel */}
            <ControlPanel
              onStep={handleStep}
              onReset={handleReset}
              gameStatus={gameStatus}
              isAutoRunning={autoRunning}
              onAutoRunChange={setAutoRunning}
            />
          </aside>

          {/* Center - Grid */}
          <section className="flex-1 glass p-5 min-w-0 flex items-start justify-center">
            <div className="w-full" style={{ transform: "scale(0.85)", transformOrigin: "center top" }}>
              <GridRenderer grid={grid} agentPos={agentPos} config={config} />
            </div>
          </section>

          {/* Right sidebar - Log, Metrics, KB */}
          <aside className="w-full lg:w-[22rem] flex flex-col gap-4 shrink-0 max-h-[calc(100vh-200px)] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <PerceptLogPanel moveHistory={moveHistory} />

            {/* Metrics dashboard */}
            <MetricsDashboard
              gameStatus={gameStatus}
              moveCount={moveCount}
              totalInferenceSteps={totalInferenceSteps}
              lastPercepts={lastPercepts}
              grid={grid}
              agentPos={agentPos}
              config={config}
            />

            {/* KB Panel */}
            <KBPanel
              kb={kb}
              lastPercepts={lastPercepts}
              agentPos={agentPos}
              config={config}
            />
          </aside>
        </main>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="w-full border-t border-black/10 px-6 py-3 text-center">
          <p className="text-xs text-slate-600">
            Wumpus World Agent · Phase 3 · Navigation AI + Metrics Dashboard + Logging
          </p>
        </footer>
      </div>

      {/* ── Win/Lose Overlay ──────────────────────────────────── */}
      {showOverlay && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          style={{
            background: showOverlay === 'dead' 
              ? 'rgba(255, 71, 87, 0.15)' 
              : showOverlay === 'won' 
              ? 'rgba(46, 213, 115, 0.15)'
              : 'rgba(191, 95, 255, 0.1)',
            animation: showOverlay === 'won' 
              ? 'pulse-win 1s ease-in-out infinite'
              : showOverlay === 'dead'
              ? 'pulse-dead 1s ease-in-out infinite'
              : 'pulse-stuck 1.5s ease-in-out infinite',
          }}
        >
          <div
            className="text-center pointer-events-auto flex flex-col items-center gap-4"
            style={{
              padding: '2rem',
              borderRadius: '1rem',
              background: showOverlay === 'dead'
                ? 'rgba(5, 5, 8, 0.9)'
                : showOverlay === 'won'
                ? 'rgba(5, 5, 8, 0.9)'
                : 'rgba(5, 5, 8, 0.85)',
              border: `2px solid ${showOverlay === 'dead' ? 'var(--neon-red)' : showOverlay === 'won' ? 'var(--neon-gold)' : 'var(--neon-purple)'}`,
              boxShadow: `0 0 40px ${showOverlay === 'dead' ? 'rgba(255, 71, 87, 0.4)' : showOverlay === 'won' ? 'rgba(46, 213, 115, 0.4)' : 'rgba(191, 95, 255, 0.3)'}`,
            }}
          >
            <div style={{ fontSize: '3rem' }}>
              {showOverlay === 'dead' && '✗'}
              {showOverlay === 'won' && '★'}
              {showOverlay === 'stuck' && '⚠'}
            </div>
            <h2
              className="text-2xl font-bold uppercase tracking-widest"
              style={{
                color: showOverlay === 'dead' ? 'var(--neon-red)' : showOverlay === 'won' ? 'var(--neon-gold)' : 'var(--neon-purple)',
              }}
            >
              {showOverlay === 'dead' && 'Game Over'}
              {showOverlay === 'won' && 'Victory!'}
              {showOverlay === 'stuck' && 'Agent Stuck'}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(226, 232, 240, 0.6)' }}>
              {showOverlay === 'dead' && 'Agent fell into a pit or was eaten by the Wumpus.'}
              {showOverlay === 'won' && 'All safe cells explored! Mission accomplished.'}
              {showOverlay === 'stuck' && 'No more provably safe moves available.'}
            </p>
            <button
              onClick={handleReset}
              className="btn-neon px-6 py-2 mt-2"
              style={{
                color: showOverlay === 'dead' ? 'var(--neon-red)' : showOverlay === 'won' ? 'var(--neon-gold)' : 'var(--neon-purple)',
                borderColor: showOverlay === 'dead' ? 'var(--neon-red)' : showOverlay === 'won' ? 'var(--neon-gold)' : 'var(--neon-purple)',
              }}
            >
              Reset Game
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-dead {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes pulse-win {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes pulse-stuck {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
