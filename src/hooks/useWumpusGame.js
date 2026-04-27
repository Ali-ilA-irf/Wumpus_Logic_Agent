/**
 * src/hooks/useWumpusGame.js
 *
 * Complete game hook with navigation AI, status tracking, and logging.
 *
 * Exported API:
 *   grid, agentPos, config, kb, lastPercepts, gameStatus, moveHistory
 *   newGame(rows, cols)
 *   moveAgent(row, col)
 *   agentStep()        ← AI decision: find safe neighbor or mark stuck
 *   resetGame()        ← start over
 */

import { useState, useCallback } from 'react';
import { createEmptyGrid, populateGrid, populateWinnableGrid } from '../engine/gridUtils';
import { createKB, tell, inferSafeCells, ask, neg, pitLit, wumpusLit, getInferenceSteps, resetInferenceSteps } from '../engine/kb';
import { getPercepts } from '../engine/percepts';

const INIT_ROWS = 4;
const INIT_COLS = 4;

function buildInitialState(rows, cols, isWinnable = false) {
  const r = Math.max(2, Math.min(rows, 20));
  const c = Math.max(2, Math.min(cols, 20));
  const empty = createEmptyGrid(r, c);
  const grid  = isWinnable ? populateWinnableGrid(empty, r, c) : populateGrid(empty, r, c);

  // Process spawn cell (0,0)
  const percepts = getPercepts(grid, { row: 0, col: 0 });
  let   kb       = createKB();
  resetInferenceSteps();
  kb = tell(kb, percepts, { row: 0, col: 0 }, r, c);

  // Infer safe cells from spawn percepts
  const safeCells = inferSafeCells(kb, grid, r, c);
  const finalGrid = grid.map(row => row.map(cell => ({ ...cell })));
  for (const { row: sr, col: sc } of safeCells) {
    finalGrid[sr][sc].safe = true;
  }

  return {
    config:          { rows: r, cols: c },
    grid:            finalGrid,
    agentPos:        { row: 0, col: 0 },
    kb,
    lastPercepts:    percepts,
    gameStatus:      'alive',  // alive | dead | won
    moveCount:       0,
    moveHistory:     [],
    totalInferenceSteps: getInferenceSteps(),
  };
}

/**
 * Get neighbors of (row, col) within grid bounds.
 */
function getNeighbors(row, col, rows, cols) {
  return [
    [row - 1, col], [row + 1, col],
    [row, col - 1], [row, col + 1],
  ].filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);
}

export function useWumpusGame(initialRows = INIT_ROWS, initialCols = INIT_COLS) {
  const [state, setState] = useState(() => buildInitialState(initialRows, initialCols));

  const resetGame = useCallback(() => {
    setState(buildInitialState(state.config.rows, state.config.cols));
  }, [state.config.rows, state.config.cols]);

  const newGame = useCallback((rows, cols) => {
    setState(buildInitialState(rows, cols));
  }, []);

  /**
   * Move the agent to (row, col).
   * 1. Mark cell visited.
   * 2. Read percepts from hidden grid truth.
   * 3. TELL the KB and log the move.
   * 4. Check for win/lose conditions.
   * 5. Infer safe cells.
   * 6. Batch-update all state.
   */
  const moveAgent = useCallback((row, col) => {
    setState(prev => {
      const { grid: prevGrid, kb: prevKB, config, gameStatus, moveCount, moveHistory } = prev;
      const { rows, cols } = config;
      const { row: prevRow, col: prevCol } = prev.agentPos;

      // Don't allow moves if game is over
      if (gameStatus !== 'alive') return prev;

      // Boundary guard
      if (row < 0 || row >= rows || col < 0 || col >= cols) return prev;

      // 1. Clone grid and mark visited
      const grid = prevGrid.map(r => r.map(cell => ({ ...cell })));
      grid[row][col].visited = true;

      // 2. Get percepts (reads hidden truth)
      const percepts = getPercepts(grid, { row, col });

      // Reset step counter for this move
      resetInferenceSteps();

      // 3. Update KB
      const kb = tell(prevKB, percepts, { row, col }, rows, cols);
      const stepsThisMove = getInferenceSteps();

      // 4. Check for hazards (lose condition)
      let newStatus = 'alive';
      if (grid[row][col].hasPit || grid[row][col].hasWumpus) {
        newStatus = 'dead';
      }

      // 5. Infer safe cells and apply to grid
      const safeCells = inferSafeCells(kb, grid, rows, cols);
      for (const { row: sr, col: sc } of safeCells) {
        grid[sr][sc].safe = true;
      }

      // 6. Count visited and safe cells
      const cellsVisited = grid.flat().filter(c => c.visited).length;
      const cellsSafe = grid.flat().filter(c => c.safe && !c.visited).length;
      const nonHazardCells = grid.flat().filter(c => !c.hasPit && !c.hasWumpus).length;

      // Check for win condition
      if (newStatus === 'alive') {
        if (grid[row][col].hasGold) {
          newStatus = 'won';
        } else if (cellsVisited === nonHazardCells) {
          newStatus = 'won';
        }
      }

      // 7. Log the move
      const newLog = [
        ...moveHistory,
        {
          moveNumber: moveCount + 1,
          from: { row: prevRow, col: prevCol },
          to: { row, col },
          percepts,
          stepsUsed: stepsThisMove,
          cellsVisited,
          cellsSafe,
        },
      ];

      return {
        ...prev,
        grid,
        agentPos:     { row, col },
        kb,
        lastPercepts: percepts,
        gameStatus:   newStatus,
        moveCount:    moveCount + 1,
        moveHistory:  newLog,
        totalInferenceSteps: prev.totalInferenceSteps + stepsThisMove,
      };
    });
  }, []);

  /**
   * AI Decision Loop: Find a provably safe neighbor and move to it.
   * If none exists, mark as stuck.
   */
  const agentStep = useCallback(() => {
    setState(prev => {
      const { agentPos, kb, config, gameStatus } = prev;
      const { rows, cols } = config;

      if (gameStatus !== 'alive') return prev;

      const { row, col } = agentPos;

      // Get unvisited neighbors
      const neighbors = getNeighbors(row, col, rows, cols);
      const unvisited = neighbors.filter(([nr, nc]) => !prev.grid[nr][nc].visited);

      if (unvisited.length === 0) {
        // No unvisited neighbors → stuck
        setState(s => ({
          ...s,
          gameStatus: 'stuck',
        }));
        return prev;
      }

      // Find first provably safe neighbor
      for (const [nr, nc] of unvisited) {
        const noPit = ask(neg(pitLit(nr, nc)), kb);
        const noWmp = ask(neg(wumpusLit(nr, nc)), kb);

        if (noPit && noWmp) {
          // Found safe neighbor → move to it
          // We can't directly call moveAgent here, so return state that will trigger moveAgent
          // Instead, we'll let the component handle this
          return {
            ...prev,
            nextAgentStep: { row: nr, col: nc },
          };
        }
      }

      // No provably safe neighbor found → stuck
      setState(s => ({
        ...s,
        gameStatus: 'stuck',
      }));
      return prev;
    });

    // If agentStep found a safe move, trigger it
    if (state.nextAgentStep) {
      moveAgent(state.nextAgentStep.row, state.nextAgentStep.col);
      setState(s => ({ ...s, nextAgentStep: null }));
    }
  }, [state, moveAgent]);

  const playWinnableGame = useCallback((rows, cols) => {
    setState(buildInitialState(rows, cols, true));
  }, []);

  return {
    grid:                 state.grid,
    agentPos:             state.agentPos,
    config:               state.config,
    kb:                   state.kb,
    lastPercepts:         state.lastPercepts,
    gameStatus:           state.gameStatus,
    moveCount:            state.moveCount,
    moveHistory:          state.moveHistory,
    totalInferenceSteps:  state.totalInferenceSteps,
    newGame,
    playWinnableGame,
    moveAgent,
    agentStep,
    resetGame,
  };
}
