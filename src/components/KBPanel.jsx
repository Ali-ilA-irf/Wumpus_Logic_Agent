/**
 * src/components/KBPanel.jsx
 *
 * Displays the current Knowledge Base state:
 *  – Last percepts received
 *  – Total clause count
 *  – Recent clauses (newest first, truncated)
 *  – Live query interface: type a literal, press Enter → ASK the KB
 */

import { useState } from 'react';
import { ask, neg, pitLit, wumpusLit, getInferenceSteps, resetInferenceSteps, askWithDiagnostics } from '../engine/kb';

function PerceptBadge({ active, icon, label, color }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-300"
      style={{
        background:   active ? `rgba(${color},0.12)` : 'rgba(255,255,255,0.03)',
        border:       `1px solid ${active ? `rgba(${color},0.5)` : 'rgba(255,255,255,0.06)'}`,
        color:        active ? `rgb(${color})`       : 'rgba(255,255,255,0.2)',
        boxShadow:    active ? `0 0 8px rgba(${color},0.3)` : 'none',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

export default function KBPanel({ kb, lastPercepts, agentPos, config }) {
  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState(null);

  const { row, col } = agentPos;
  const { rows, cols } = config;

  function handleQuery(e) {
    e.preventDefault();
    const q = queryInput.trim();
    if (!q) return;
    
    // Reset and run diagnostics
    resetInferenceSteps();
    const result = askWithDiagnostics(q, kb);
    setQueryResult({ 
      query: q, 
      entailed: result.entailed,
      steps: result.steps
    });
  }

  // Show newest clauses first, limited to 20
  const recentClauses = [...kb].reverse().slice(0, 20);

  return (
    <div className="glass flex flex-col gap-4 p-5 w-full">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--neon-purple)' }}
        >
          Knowledge Base
        </h2>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(191,95,255,0.1)', color: 'var(--neon-purple)', border: '1px solid rgba(191,95,255,0.25)' }}
        >
          {kb.length} clauses
        </span>
      </div>

      {/* Percept badges */}
      {lastPercepts && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
            Percepts @ ({row},{col})
          </p>
          <div className="flex gap-2 flex-wrap">
            <PerceptBadge active={lastPercepts.breeze}  icon="~" label="Breeze"  color="0,245,255" />
            <PerceptBadge active={lastPercepts.stench}  icon="☠" label="Stench"  color="191,95,255" />
            <PerceptBadge active={lastPercepts.glitter} icon="✦" label="Glitter" color="255,215,0" />
          </div>
        </div>
      )}

      {/* Quick safe-cell query buttons */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          Neighbor Safety (ASK)
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            [row - 1, col], [row + 1, col],
            [row, col - 1], [row, col + 1],
          ]
            .filter(([r, c]) => r >= 0 && r < rows && c >= 0 && c < cols)
            .map(([r, c]) => {
              const noPit = ask(neg(pitLit(r, c)), kb);
              const noWmp = ask(neg(wumpusLit(r, c)), kb);
              const safe  = noPit && noWmp;
              return (
                <div
                  key={`${r}-${c}`}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono"
                  style={{
                    background: safe ? 'rgba(46,213,115,0.08)' : 'rgba(255,71,87,0.06)',
                    border:     `1px solid ${safe ? 'rgba(46,213,115,0.25)' : 'rgba(255,71,87,0.15)'}`,
                    color:      safe ? 'var(--neon-green)' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  <span>{safe ? '✓' : '?'}</span>
                  <span>({r},{c})</span>
                  {safe && <span className="text-xs opacity-60">safe</span>}
                </div>
              );
            })}
        </div>
      </div>

      {/* Recent clauses */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          Inference Metrics
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2 rounded" style={{ background: 'rgba(191,95,255,0.08)', border: '1px solid rgba(191,95,255,0.2)' }}>
            <p className="text-xs opacity-60">Total Clauses</p>
            <p className="text-sm font-bold" style={{ color: 'var(--neon-purple)' }}>{kb.length}</p>
          </div>
          <div className="px-3 py-2 rounded" style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
            <p className="text-xs opacity-60">Inference Steps</p>
            <p className="text-sm font-bold" style={{ color: 'var(--neon-cyan)' }}>{getInferenceSteps()}</p>
          </div>
        </div>
      </div>

      {/* Recent clauses */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          Recent Clauses
        </p>
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {recentClauses.length === 0 && (
            <p className="text-xs text-slate-700 italic">KB is empty.</p>
          )}
          {recentClauses.map((clause, i) => (
            <div
              key={i}
              className="text-xs font-mono px-2 py-1 rounded"
              style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(226,232,240,0.55)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              ({clause.join(' ∨ ')})
            </div>
          ))}
        </div>
      </div>

      {/* Custom ASK interface */}
      <form onSubmit={handleQuery} className="flex flex-col gap-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider">
          ASK the KB
        </p>
        <div className="flex gap-2">
          <input
            id="kb-query-input"
            type="text"
            value={queryInput}
            onChange={e => setQueryInput(e.target.value)}
            placeholder="e.g. ¬P_1_2"
            className="wumpus-input flex-1 text-xs"
          />
          <button
            id="kb-query-submit"
            type="submit"
            className="btn-neon py-1.5 text-xs px-3"
          >
            ASK
          </button>
        </div>
        {queryResult && (
          <div
            className="text-xs font-mono px-3 py-2 rounded"
            style={{
              background: queryResult.entailed ? 'rgba(46,213,115,0.1)' : 'rgba(255,71,87,0.08)',
              border:     `1px solid ${queryResult.entailed ? 'rgba(46,213,115,0.3)' : 'rgba(255,71,87,0.2)'}`,
              color:      queryResult.entailed ? 'var(--neon-green)' : 'var(--neon-red)',
            }}
          >
            <div className="flex items-center justify-between">
              <span>
                KB ⊨ {queryResult.query}?&nbsp;&nbsp;
                <strong>{queryResult.entailed ? '✓ YES' : '✗ NOT ENTAILED'}</strong>
              </span>
              <span className="text-xs opacity-75">
                {queryResult.steps} steps
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
