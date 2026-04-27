/**
 * src/components/PerceptLogPanel.jsx
 *
 * Scrollable move history log — shows each move with percepts and KB updates.
 * Essential for demonstrating the logic engine in real time.
 */

function LogEntry({ move, index }) {
  return (
    <div
      key={index}
      className="p-3 rounded-lg font-mono text-xs border"
      style={{
        background: 'rgba(10, 10, 18, 0.4)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Move header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-black/10">
        <span style={{ color: 'var(--neon-cyan)' }}>
          Move {move.moveNumber}
        </span>
        <span style={{ color: 'var(--neon-purple)' }}>
          {move.stepsUsed} steps
        </span>
      </div>

      {/* Position */}
      <div className="text-xs mb-2">
        <span style={{ opacity: 0.6 }}>({move.from.row},{move.from.col})</span>
        <span style={{ opacity: 0.4 }}> → </span>
        <span style={{ color: 'var(--neon-cyan)' }}>
          ({move.to.row},{move.to.col})
        </span>
      </div>

      {/* Percepts detected */}
      <div className="flex gap-1 mb-2 flex-wrap">
        {move.percepts.breeze && (
          <span
            className="px-1.5 py-0.5 rounded text-xs"
            style={{ background: 'rgba(0,245,255,0.15)', color: 'var(--neon-cyan)' }}
          >
            ~ Breeze
          </span>
        )}
        {move.percepts.stench && (
          <span
            className="px-1.5 py-0.5 rounded text-xs"
            style={{ background: 'rgba(191,95,255,0.15)', color: 'var(--neon-purple)' }}
          >
            ☠ Stench
          </span>
        )}
        {move.percepts.glitter && (
          <span
            className="px-1.5 py-0.5 rounded text-xs"
            style={{ background: 'rgba(255,215,0,0.15)', color: 'var(--neon-gold)' }}
          >
            ✦ Glitter
          </span>
        )}
        {!move.percepts.breeze && !move.percepts.stench && !move.percepts.glitter && (
          <span style={{ opacity: 0.4 }}>No percepts</span>
        )}
      </div>

      {/* Statistics */}
      <div className="text-xs opacity-70 border-t border-black/10 pt-1.5">
        <div className="flex justify-between">
          <span>Visited: {move.cellsVisited}</span>
          <span>Safe: {move.cellsSafe}</span>
        </div>
      </div>
    </div>
  );
}

export default function PerceptLogPanel({ moveHistory }) {
  return (
    <div className="glass p-5 w-full flex flex-col gap-3">
      {/* Title */}
      <h2
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--neon-gold)' }}
      >
        Move Log
      </h2>

      {/* Log container */}
      <div
        className="flex flex-col gap-2 max-h-80 overflow-y-auto"
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin'
        }}
      >
        {moveHistory.length === 0 && (
          <div
            className="text-xs text-center py-4"
            style={{ color: 'rgba(226, 232, 240, 0.3)' }}
          >
            No moves yet. Click "Step" or "Auto-Run" to begin.
          </div>
        )}

        {/* Render moves in reverse (newest first) */}
        {[...moveHistory].reverse().map((move, idx) => (
          <LogEntry key={moveHistory.length - 1 - idx} move={move} index={moveHistory.length - 1 - idx} />
        ))}
      </div>

      {/* Summary */}
      {moveHistory.length > 0 && (
        <div
          className="text-xs px-2 py-1.5 rounded-lg border"
          style={{
            background: 'rgba(0, 245, 255, 0.04)',
            borderColor: 'rgba(0, 245, 255, 0.15)',
            color: 'var(--neon-cyan)',
          }}
        >
          Total moves: <span style={{ fontWeight: 'bold' }}>{moveHistory.length}</span>
        </div>
      )}
    </div>
  );
}
