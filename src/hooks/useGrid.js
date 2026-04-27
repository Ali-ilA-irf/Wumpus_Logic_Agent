/**
 * src/hooks/useGrid.js
 *
 * Central state hook for the Wumpus World.
 *
 * Exposes:
 *  – grid           : 2-D array of cell objects (world truth)
 *  – agentPos       : { row, col }
 *  – config         : { rows, cols }
 *  – newGame(r, c)  : reset and re-populate the grid
 *  – moveAgent(r,c) : move agent to a new cell and reveal percepts
 */

import { useState, useCallback } from 'react';
import { createEmptyGrid, populateGrid } from '../engine/gridUtils';

const DEFAULT_ROWS = 4;
const DEFAULT_COLS = 4;

/**
 * @param {number} [initialRows]
 * @param {number} [initialCols]
 */
export function useGrid(initialRows = DEFAULT_ROWS, initialCols = DEFAULT_COLS) {
  const [config, setConfig] = useState({ rows: initialRows, cols: initialCols });
  const [grid, setGrid]     = useState(() => {
    const empty = createEmptyGrid(initialRows, initialCols);
    return populateGrid(empty, initialRows, initialCols);
  });
  const [agentPos, setAgentPos] = useState({ row: 0, col: 0 });

  /**
   * Start a new game: resize the grid, re-scatter hazards, reset agent.
   *
   * @param {number} rows
   * @param {number} cols
   */
  const newGame = useCallback((rows, cols) => {
    const r = Math.max(1, Math.min(rows, 20));
    const c = Math.max(1, Math.min(cols, 20));
    setConfig({ rows: r, cols: c });
    const empty = createEmptyGrid(r, c);
    const populated = populateGrid(empty, r, c);
    setGrid(populated);
    setAgentPos({ row: 0, col: 0 });
  }, []);

  /**
   * Move the agent to (row, col), marking the cell as visited & revealing its
   * percepts.  No boundary or validity check — callers must validate.
   *
   * @param {number} row
   * @param {number} col
   */
  const moveAgent = useCallback((row, col) => {
    setGrid(prev => {
      const next = prev.map(r => r.map(cell => ({ ...cell })));
      next[row][col].visited = true;
      // A cell is confirmed safe only if it has no pit and no wumpus
      if (!next[row][col].hasPit && !next[row][col].hasWumpus) {
        next[row][col].safe = true;
      }
      return next;
    });
    setAgentPos({ row, col });
  }, []);

  return { grid, agentPos, config, newGame, moveAgent };
}
