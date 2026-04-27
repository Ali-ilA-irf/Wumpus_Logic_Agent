/**
 * src/engine/gridUtils.js
 *
 * Pure functions for initialising and randomly populating the Wumpus World grid.
 * All world-truth (pits, wumpus) is stored in the grid but NOT exposed to the
 * agent renderer until the agent actually visits that cell.
 */

/**
 * Create a fresh 2-D array of cell objects.
 * Every cell starts fully unknown / unvisited.
 *
 * @param {number} rows
 * @param {number} cols
 * @returns {Array<Array<CellObject>>}
 */
export function createEmptyGrid(rows, cols) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      // ── World truth (hidden from agent until visited) ──
      hasPit:    false,
      hasWumpus: false,
      hasGold:   false,
      // ── Percepts (revealed when a neighbouring cell is visited) ──
      breeze: false,   // true when an adjacent pit exists
      stench: false,   // true when an adjacent wumpus exists
      glitter: false,  // true when this cell has gold
      // ── Agent knowledge ──
      visited: false,
      safe:    false,
    }))
  );
}

/**
 * Adjacent (up/down/left/right) cell coordinates, clamped to grid bounds.
 *
 * @param {number} r
 * @param {number} c
 * @param {number} rows
 * @param {number} cols
 * @returns {Array<[number, number]>}
 */
export function getNeighbours(r, c, rows, cols) {
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ].filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);
}

/**
 * Randomly place pits and one Wumpus on the grid.
 * Rules:
 *  – Cell (0,0) is always safe (agent spawn).
 *  – Wumpus is placed exactly once.
 *  – Each non-spawn cell has a ~20 % chance of becoming a pit.
 *  – Gold is placed on exactly one random non-spawn cell.
 *
 * After placement, breeze / stench / glitter percepts are computed.
 *
 * @param {Array<Array<object>>} grid   mutable grid (will be deep-cloned internally)
 * @param {number} rows
 * @param {number} cols
 * @param {number} [pitProbability=0.2]
 * @returns {Array<Array<object>>}      new grid with hazards placed
 */
export function populateGrid(grid, rows, cols, pitProbability = 0.2) {
  // Deep clone so we never mutate the original reference
  const g = grid.map(row => row.map(cell => ({ ...cell })));

  // Collect candidate cells (everything except (0,0))
  const candidates = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 && c === 0) continue;
      candidates.push([r, c]);
    }
  }

  if (candidates.length === 0) return g; // 1×1 grid edge-case

  // ── Place pits ──────────────────────────────────────────────────────────────
  for (const [r, c] of candidates) {
    if (Math.random() < pitProbability) {
      g[r][c].hasPit = true;
    }
  }

  // ── Place Wumpus ────────────────────────────────────────────────────────────
  // Pick a random candidate that is not already a pit
  const safeForWumpus = candidates.filter(([r, c]) => !g[r][c].hasPit);
  if (safeForWumpus.length > 0) {
    const [wr, wc] = safeForWumpus[Math.floor(Math.random() * safeForWumpus.length)];
    g[wr][wc].hasWumpus = true;
  }

  // ── Place Gold ──────────────────────────────────────────────────────────────
  const safeForGold = candidates.filter(([r, c]) => !g[r][c].hasPit && !g[r][c].hasWumpus);
  if (safeForGold.length > 0) {
    const [gr2, gc2] = safeForGold[Math.floor(Math.random() * safeForGold.length)];
    g[gr2][gc2].hasGold   = true;
    g[gr2][gc2].glitter   = true;
  }

  // ── Compute percepts ────────────────────────────────────────────────────────
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const neighbours = getNeighbours(r, c, rows, cols);
      g[r][c].breeze = neighbours.some(([nr, nc]) => g[nr][nc].hasPit);
      g[r][c].stench = neighbours.some(([nr, nc]) => g[nr][nc].hasWumpus);
    }
  }

  // ── Mark spawn cell ─────────────────────────────────────────────────────────
  g[0][0].visited = true;
  g[0][0].safe    = true;

  return g;
}

export function populateWinnableGrid(grid, rows, cols) {
  const g = grid.map(row => row.map(cell => ({ ...cell })));
  
  // Ensure a safe path exists to the gold at (0, cols-1) or (rows-1, cols-1)
  const gr = rows > 2 ? 2 : rows - 1;
  const gc = cols > 2 ? 2 : cols - 1;
  g[gr][gc].hasGold = true;
  g[gr][gc].glitter = true;

  // Put wumpus far away
  if (rows > 3 && cols > 3) g[3][3].hasWumpus = true;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const neighbours = getNeighbours(r, c, rows, cols);
      g[r][c].breeze = neighbours.some(([nr, nc]) => g[nr][nc].hasPit);
      g[r][c].stench = neighbours.some(([nr, nc]) => g[nr][nc].hasWumpus);
    }
  }

  g[0][0].visited = true;
  g[0][0].safe    = true;
  return g;
}
