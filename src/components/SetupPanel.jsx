/**
 * src/components/SetupPanel.jsx
 *
 * Configuration panel: rows × cols inputs + New Game button.
 * Validates input and calls onNewGame(rows, cols).
 */

import { useState } from 'react';

const MIN = 2;
const MAX = 20;

export default function SetupPanel({ currentRows, currentCols, onNewGame, onWinnableGame }) {
  const [rows, setRows] = useState(currentRows);
  const [cols, setCols] = useState(currentCols);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const r = parseInt(rows, 10);
    const c = parseInt(cols, 10);
    if (isNaN(r) || isNaN(c) || r < MIN || c < MIN || r > MAX || c > MAX) {
      setError(`Rows and Cols must be between ${MIN} and ${MAX}.`);
      return;
    }
    setError('');
    onNewGame(r, c);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass flex flex-col gap-4 p-5 w-full"
      aria-label="Game configuration panel"
    >
      {/* Title */}
      <div>
        <h2
          className="text-xs font-semibold uppercase tracking-widest text-glow-purple"
          style={{ color: 'var(--neon-purple)' }}
        >
          Configure World
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Set the grid dimensions, then start a new game.
        </p>
      </div>

      {/* Inputs row */}
      <div className="flex gap-3">
        {/* Rows */}
        <div className="flex-1 flex flex-col gap-1">
          <label
            htmlFor="input-rows"
            className="text-xs font-medium text-slate-400 uppercase tracking-wider"
          >
            Rows
          </label>
          <input
            id="input-rows"
            type="number"
            min={MIN}
            max={MAX}
            value={rows}
            onChange={e => setRows(e.target.value)}
            className="wumpus-input"
            aria-describedby="setup-error"
          />
        </div>

        {/* Cols */}
        <div className="flex-1 flex flex-col gap-1">
          <label
            htmlFor="input-cols"
            className="text-xs font-medium text-slate-400 uppercase tracking-wider"
          >
            Cols
          </label>
          <input
            id="input-cols"
            type="number"
            min={MIN}
            max={MAX}
            value={cols}
            onChange={e => setCols(e.target.value)}
            className="wumpus-input"
            aria-describedby="setup-error"
          />
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-2 justify-end">
          <button
            id="btn-new-game"
            type="submit"
            className="btn-neon text-xs px-2 py-1"
          >
            Random
          </button>
          <button
            type="button"
            onClick={() => {
              const r = parseInt(rows, 10);
              const c = parseInt(cols, 10);
              if (!isNaN(r) && !isNaN(c) && r >= MIN && c >= MIN && r <= MAX && c <= MAX) {
                setError('');
                onWinnableGame(r, c);
              }
            }}
            className="btn-neon text-xs px-2 py-1"
            style={{ 
              background: 'linear-gradient(135deg, rgba(46,213,115,0.1), rgba(0,245,255,0.1))',
              borderColor: 'var(--neon-green)',
              color: 'var(--neon-green)'
            }}
          >
            Winnable
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p
          id="setup-error"
          role="alert"
          className="text-xs"
          style={{ color: 'var(--neon-red)' }}
        >
          ⚠ {error}
        </p>
      )}

      {/* Current world info */}
      <div className="flex gap-2 flex-wrap">
        <span className="legend-badge" style={{ color: 'var(--neon-cyan)', borderColor: 'rgba(0,245,255,0.25)' }}>
          Grid {currentRows} × {currentCols}
        </span>
        <span className="legend-badge" style={{ color: 'var(--neon-purple)', borderColor: 'rgba(191,95,255,0.25)' }}>
          {currentRows * currentCols} cells
        </span>
      </div>
    </form>
  );
}
