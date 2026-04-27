/**
 * src/components/MetricsDashboard.jsx
 *
 * Metrics sidebar — displays live game statistics.
 * Shows: Total Inference Steps, Current Percepts, Cells Visited, 
 * Cells Proven Safe, Game Status, Move Count.
 */

import { useMemo } from 'react';

function StatusBadge({ status }) {
  let bgColor, textColor, icon;
  
  switch (status) {
    case 'alive':
      bgColor = 'rgba(46, 213, 115, 0.1)';
      textColor = 'var(--neon-green)';
      icon = '✓';
      break;
    case 'dead':
      bgColor = 'rgba(255, 71, 87, 0.15)';
      textColor = 'var(--neon-red)';
      icon = '✗';
      break;
    case 'won':
      bgColor = 'rgba(255, 215, 0, 0.15)';
      textColor = 'var(--neon-gold)';
      icon = '★';
      break;
    case 'stuck':
      bgColor = 'rgba(191, 95, 255, 0.1)';
      textColor = 'var(--neon-purple)';
      icon = '⚠';
      break;
    default:
      bgColor = 'rgba(255, 255, 255, 0.04)';
      textColor = 'rgba(255, 255, 255, 0.4)';
      icon = '?';
  }
  
  return (
    <div
      className="px-3 py-2 rounded-lg flex items-center gap-2"
      style={{
        background: bgColor,
        border: `1px solid ${textColor}33`,
      }}
    >
      <span style={{ color: textColor, fontSize: '1rem' }}>{icon}</span>
      <span style={{ color: textColor, fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
        {status}
      </span>
    </div>
  );
}

function MetricRow({ label, value, unit, color, icon }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-black/10 last:border-b-0">
      <span className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        {icon && <span style={{ color, opacity: 0.6 }}>{icon}</span>}
        {label}
      </span>
      <span
        className="text-sm font-mono font-semibold"
        style={{ color: color || 'var(--neon-cyan)' }}
      >
        {value}{unit && <span className="text-xs opacity-60 ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

export default function MetricsDashboard({ 
  gameStatus, 
  moveCount, 
  totalInferenceSteps, 
  lastPercepts, 
  grid,
  agentPos,
  config,
}) {
  const stats = useMemo(() => {
    const cellsVisited = grid?.flat().filter(c => c.visited).length ?? 0;
    const cellsSafe = grid?.flat().filter(c => c.safe && !c.visited).length ?? 0;
    const nonHazardCells = grid?.flat().filter(c => !c.hasPit && !c.hasWumpus).length ?? 0;
    
    return {
      cellsVisited,
      cellsSafe,
      nonHazardCells,
    };
  }, [grid]);

  return (
    <div className="glass p-5 w-full flex flex-col gap-4">
      {/* Title + Status */}
      <div className="flex items-center justify-between">
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--neon-green)' }}
        >
          Game Metrics
        </h2>
        <StatusBadge status={gameStatus} />
      </div>

      {/* Game Progress */}
      <div className="flex flex-col gap-2">
        <MetricRow
          icon="◈"
          label="Move Count"
          value={moveCount}
          color="var(--neon-cyan)"
        />
        <MetricRow
          icon="⊙"
          label="Inference Steps"
          value={totalInferenceSteps}
          color="var(--neon-purple)"
        />
      </div>

      {/* Percepts Section */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          Current Percepts
        </p>
        {lastPercepts ? (
          <div className="flex gap-1.5 flex-wrap">
            {lastPercepts.breeze && (
              <div className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(0,245,255,0.12)', color: 'var(--neon-cyan)', border: '1px solid rgba(0,245,255,0.3)' }}>
                ~ Breeze
              </div>
            )}
            {lastPercepts.stench && (
              <div className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(191,95,255,0.12)', color: 'var(--neon-purple)', border: '1px solid rgba(191,95,255,0.3)' }}>
                ☠ Stench
              </div>
            )}
            {lastPercepts.glitter && (
              <div className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,215,0,0.12)', color: 'var(--neon-gold)', border: '1px solid rgba(255,215,0,0.3)' }}>
                ✦ Glitter
              </div>
            )}
            {!lastPercepts.breeze && !lastPercepts.stench && !lastPercepts.glitter && (
              <div className="text-xs px-2 py-1 rounded-lg opacity-50">
                None
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-600 italic">—</div>
        )}
      </div>

      {/* Cells Section */}
      <div className="flex flex-col gap-2">
        <MetricRow
          icon="✓"
          label="Cells Visited"
          value={stats.cellsVisited}
          unit={`/ ${stats.nonHazardCells}`}
          color="var(--neon-green)"
        />
        <MetricRow
          icon="⬚"
          label="Cells Proven Safe"
          value={stats.cellsSafe}
          color="var(--neon-cyan)"
        />
      </div>

      {/* Progress bar */}
      <div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${(stats.cellsVisited / stats.nonHazardCells) * 100}%`,
              background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))',
            }}
          />
        </div>
        <p className="text-xs text-slate-600 mt-1 text-center">
          {Math.round((stats.cellsVisited / stats.nonHazardCells) * 100)}% Complete
        </p>
      </div>
    </div>
  );
}
