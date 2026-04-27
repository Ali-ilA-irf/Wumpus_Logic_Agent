/**
 * src/components/ControlPanel.jsx
 *
 * Movement control buttons: Step, Auto-Run, Reset.
 * Features interval-based auto-run with pause on win/lose.
 */

import { useState, useEffect, useRef } from 'react';

export default function ControlPanel({ 
  onStep,
  onReset,
  gameStatus,
  isAutoRunning = false,
  onAutoRunChange = () => {},
}) {
  const [autoRunning, setAutoRunning] = useState(false);
  const intervalRef = useRef(null);

  // Pause auto-run if game is over
  useEffect(() => {
    if ((gameStatus === 'dead' || gameStatus === 'won' || gameStatus === 'stuck') && autoRunning) {
      setAutoRunning(false);
      onAutoRunChange(false);
    }
  }, [gameStatus, autoRunning, onAutoRunChange]);

  // Setup auto-run interval
  useEffect(() => {
    if (autoRunning && gameStatus === 'alive') {
      intervalRef.current = setInterval(() => {
        onStep();
      }, 600);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRunning, gameStatus, onStep]);

  const handleAutoRunToggle = () => {
    if (gameStatus === 'alive') {
      setAutoRunning(!autoRunning);
      onAutoRunChange(!autoRunning);
    }
  };

  const handleReset = () => {
    setAutoRunning(false);
    onAutoRunChange(false);
    onReset();
  };

  const isDisabled = gameStatus !== 'alive' && gameStatus !== 'stuck';

  return (
    <div className="glass p-5 w-full flex flex-col gap-4">
      {/* Title */}
      <h2
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--neon-cyan)' }}
      >
        Agent Control
      </h2>

      {/* Step Button - Primary CTA */}
      <button
        id="btn-step"
        onClick={onStep}
        disabled={isDisabled}
        className="btn-neon w-full py-3 font-semibold uppercase relative overflow-hidden"
        style={{
          opacity: isDisabled ? 0.3 : 1,
          boxShadow: !isDisabled 
            ? '0 0 20px rgba(0, 245, 255, 0.4), inset 0 0 8px rgba(0, 245, 255, 0.1)'
            : 'none',
          transform: !isDisabled ? 'scale(1)' : 'scale(1)',
          transition: 'all 0.2s ease',
        }}
      >
        <span className="relative z-10">◉ Step</span>
      </button>

      {/* Auto-Run Button */}
      <button
        id="btn-autorun"
        onClick={handleAutoRunToggle}
        disabled={isDisabled}
        className="w-full py-2.5 font-semibold uppercase rounded-lg border transition-all duration-200"
        style={{
          background: autoRunning 
            ? 'linear-gradient(135deg, rgba(46,213,115,0.2), rgba(0,245,255,0.2))'
            : 'linear-gradient(135deg, rgba(191,95,255,0.1), rgba(0,245,255,0.1))',
          border: `1px solid ${autoRunning ? 'rgba(46,213,115,0.5)' : 'rgba(0,245,255,0.3)'}`,
          color: autoRunning ? 'var(--neon-green)' : 'var(--neon-cyan)',
          opacity: isDisabled ? 0.3 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {autoRunning ? '▶ Auto-Running...' : '⏸ Auto-Run (600ms)'}
      </button>

      {/* Reset Button */}
      <button
        id="btn-reset"
        onClick={handleReset}
        className="w-full py-2 font-semibold uppercase rounded-lg border transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, rgba(255,71,87,0.1), rgba(191,95,255,0.1))',
          border: '1px solid rgba(255,71,87,0.3)',
          color: 'var(--neon-red)',
          cursor: 'pointer',
        }}
      >
        ↻ Reset Game
      </button>

      {/* Status indicator */}
      <div
        className="text-xs text-center px-2 py-1.5 rounded-lg"
        style={{
          background: autoRunning 
            ? 'rgba(46, 213, 115, 0.1)'
            : 'rgba(255, 255, 255, 0.04)',
          color: autoRunning 
            ? 'var(--neon-green)'
            : 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'monospace',
        }}
      >
        {autoRunning ? '● Auto-running' : gameStatus === 'dead' ? '✗ Game Over' : gameStatus === 'won' ? '★ Won!' : gameStatus === 'stuck' ? '⚠ Stuck' : '● Ready'}
      </div>
    </div>
  );
}
