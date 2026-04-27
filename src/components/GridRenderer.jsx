/**
 * src/components/GridRenderer.jsx
 *
 * Enhanced grid renderer with liquid glass effect.
 * Each cell features:
 *  – Liquid glass base: backdrop-filter blur + semi-transparent background
 *  – State-based colors: unknown, safe, hazard, agent
 *  – Dynamic hue based on grid position (iridescent tint)
 *  – Shimmer animation on hover
 *  – Agent ripple effect
 *
 * Supports both dark and light themes via prefers-color-scheme.
 */

import { useState } from 'react';

const PERCEPT_ICONS = {
  breeze:  { icon: '~', label: 'Breeze',  color: 'var(--neon-cyan)'   },
  stench:  { icon: '☠', label: 'Stench',  color: 'var(--neon-purple)' },
  glitter: { icon: '✦', label: 'Glitter', color: 'var(--neon-gold)'   },
};

const TRUTH_ICONS = {
  hasPit:    { icon: '◯', label: 'Pit',    color: 'var(--neon-red)'    },
  hasWumpus: { icon: 'W', label: 'Wumpus', color: 'var(--neon-purple)' },
  hasGold:   { icon: '★', label: 'Gold',   color: 'var(--neon-gold)'   },
};

/**
 * Compute dynamic hue based on grid position.
 * Creates iridescent effect across the grid.
 */
function getCellHue(row, col, rows, cols) {
  const distance = Math.sqrt(
    Math.pow(row - rows / 2, 2) + Math.pow(col - cols / 2, 2)
  );
  const maxDistance = Math.sqrt(
    Math.pow(rows / 2, 2) + Math.pow(cols / 2, 2)
  );
  const hue = (distance / maxDistance) * 360;
  return Math.round(hue);
}

/**
 * Determine cell state based on visited status and world state.
 */
function getCellState(cell, isAgent) {
  if (isAgent) return 'cell-agent';
  
  if (!cell.visited) return 'cell-unknown';
  
  // Visited cell: check for hazards (in debug mode or known dangers)
  if (cell.hasPit || cell.hasWumpus) return 'cell-hazard';
  
  // Visited, safe cell
  return 'cell-safe';
}

function Cell({ cell, isAgent, debugMode, hue, rows, cols }) {
  const isStart  = cell.row === 0 && cell.col === 0;
  const revealed = cell.visited;
  const state = getCellState(cell, isAgent);

  // Build class string
  let classes = `wumpus-cell ${state}`;
  if (isStart && !isAgent) classes += ' cell-start';

  // Percept icons shown if cell is visited
  const perceptIcons = revealed
    ? Object.entries(PERCEPT_ICONS).filter(([key]) => cell[key])
    : [];

  // Truth icons shown only in debug mode
  const truthIcons = debugMode
    ? Object.entries(TRUTH_ICONS).filter(([key]) => cell[key])
    : [];

  return (
    <div
      className={classes}
      role="gridcell"
      aria-label={`Cell ${cell.row},${cell.col}${isAgent ? ' – Agent here' : ''}`}
      title={`(${cell.row}, ${cell.col})${isAgent ? ' – AGENT' : ''}`}
      style={{
        '--hue': hue,
      }}
    >
      {/* Coordinates */}
      <span
        className="absolute top-0.5 left-1 font-mono leading-none select-none"
        style={{ fontSize: '0.55rem', opacity: 0.5 }}
      >
        {cell.row},{cell.col}
      </span>

      {/* Agent marker */}
      {isAgent && (
        <span
          className="text-glow-cyan font-bold leading-none relative z-10"
          style={{ fontSize: '1rem', color: 'var(--neon-cyan)' }}
          aria-hidden="true"
        >
          ◈
        </span>
      )}

      {/* Percepts (visible after visit) */}
      {!isAgent && perceptIcons.length > 0 && (
        <div className="flex gap-0.5 flex-wrap justify-center relative z-10" aria-hidden="true">
          {perceptIcons.map(([key, { icon, color }]) => (
            <span
              key={key}
              style={{ color, fontSize: '0.75rem' }}
              title={PERCEPT_ICONS[key].label}
            >
              {icon}
            </span>
          ))}
        </div>
      )}

      {/* Unknown / unvisited placeholder */}
      {!isAgent && !revealed && (
        <span style={{ fontSize: '0.65rem', opacity: 0.2 }} aria-hidden="true">
          ?
        </span>
      )}

      {/* Debug: truth overlay */}
      {debugMode && truthIcons.length > 0 && (
        <div
          className="absolute bottom-0.5 right-0.5 flex gap-0.5 z-10"
          aria-hidden="true"
        >
          {truthIcons.map(([key, { icon, color }]) => (
            <span key={key} style={{ color, fontSize: '0.6rem' }}>
              {icon}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GridRenderer({ grid, agentPos, config }) {
  const [debugMode, setDebugMode] = useState(false);

  if (!grid || grid.length === 0) return null;

  const { rows, cols } = config;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--neon-cyan)' }}
        >
          Wumpus World — {rows} × {cols}
        </h2>

        {/* Debug toggle */}
        <label
          htmlFor="debug-toggle"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <span className="text-xs text-slate-500 uppercase tracking-wider">
            Debug
          </span>
          <div className="relative">
            <input
              id="debug-toggle"
              type="checkbox"
              className="sr-only"
              checked={debugMode}
              onChange={e => setDebugMode(e.target.checked)}
            />
            <div
              className="w-9 h-5 rounded-full transition-colors duration-200"
              style={{
                background: debugMode ? 'rgba(191,95,255,0.5)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${debugMode ? 'var(--neon-purple)' : 'rgba(255,255,255,0.12)'}`,
              }}
            />
            <div
              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-200"
              style={{
                background: debugMode ? 'var(--neon-purple)' : 'rgba(255,255,255,0.25)',
                transform: debugMode ? 'translateX(16px)' : 'translateX(0)',
                boxShadow: debugMode ? '0 0 6px var(--neon-purple)' : 'none',
              }}
            />
          </div>
        </label>
      </div>

      {/* Grid container with ambient glow */}
      <div className="wumpus-grid-container">
        <div
          role="grid"
          aria-label={`Wumpus World grid ${rows} by ${cols}`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: '4px',
            width: '100%',
            padding: '8px',
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <Cell
                key={`${r}-${c}`}
                cell={cell}
                isAgent={agentPos.row === r && agentPos.col === c}
                debugMode={debugMode}
                hue={getCellHue(r, c, rows, cols)}
                rows={rows}
                cols={cols}
              />
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="legend-badge" style={{ color: 'var(--neon-cyan)' }}>
          ◈ Agent
        </span>
        <span className="legend-badge" style={{ color: 'var(--neon-cyan)' }}>
          ~ Breeze
        </span>
        <span className="legend-badge" style={{ color: 'var(--neon-purple)' }}>
          ☠ Stench
        </span>
        <span className="legend-badge" style={{ color: 'var(--neon-gold)' }}>
          ✦ Glitter
        </span>
        {debugMode && (
          <>
            <span className="legend-badge" style={{ color: 'var(--neon-red)' }}>
              ◯ Pit
            </span>
            <span className="legend-badge" style={{ color: 'var(--neon-purple)' }}>
              W Wumpus
            </span>
            <span className="legend-badge" style={{ color: 'var(--neon-gold)' }}>
              ★ Gold
            </span>
          </>
        )}
      </div>
    </div>
  );
}
