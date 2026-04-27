/**
 * src/engine/percepts.js
 *
 * Derive percepts from the actual hidden grid state at the agent's position.
 * This is the "environment sensor" — it reads world truth and converts it to
 * the percept tuple the agent receives upon entering a cell.
 */

/**
 * @param {Array<Array<object>>} grid  — 2-D array of cell objects
 * @param {{ row: number, col: number }} pos — agent's current position
 * @returns {{ breeze: boolean, stench: boolean, glitter: boolean }}
 */
export function getPercepts(grid, pos) {
  const { row: r, col: c } = pos;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const nbrs = [
    [r - 1, c], [r + 1, c],
    [r, c - 1], [r, c + 1],
  ].filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);

  const breeze  = nbrs.some(([nr, nc]) => grid[nr][nc].hasPit);
  const stench  = nbrs.some(([nr, nc]) => grid[nr][nc].hasWumpus);
  const glitter = Boolean(grid[r][c].hasGold);

  return { breeze, stench, glitter };
}
