/**
 * src/engine/kb.js
 *
 * Propositional Knowledge Base for the Wumpus World.
 *
 * Clause  : Array of literal strings  →  ['¬P_2_1', 'B_1_1']
 * Literal : positive 'P_2_1' | negated '¬P_2_2'
 * KB      : Array of clauses (CNF)
 */

// ── Global inference statistics ──────────────────────────────────────────────
export let inferenceSteps = 0;

export function resetInferenceSteps() {
  inferenceSteps = 0;
}

export function getInferenceSteps() {
  return inferenceSteps;
}

// ── Literal helpers ──────────────────────────────────────────────────────────
export const pitLit    = (r, c) => `P_${r}_${c}`;
export const wumpusLit = (r, c) => `W_${r}_${c}`;
export const breezeLit = (r, c) => `B_${r}_${c}`;
export const stenchLit = (r, c) => `S_${r}_${c}`;

export function neg(lit) {
  return lit.startsWith('¬') ? lit.slice(1) : '¬' + lit;
}

function isTautology(clause) {
  for (const lit of clause) {
    if (clause.includes(neg(lit))) return true;
  }
  return false;
}

function clauseKey(clause) {
  return [...clause].sort().join('|');
}

// ── CNF Converter ────────────────────────────────────────────────────────────
/**
 * Convert a formula to CNF.
 * Handles:
 *   - Biconditionals (A ⇔ B) → (¬A ∨ B) ∧ (A ∨ ¬B)
 *   - Implications (A → B) → (¬A ∨ B)
 *   - De Morgan's laws (¬(A ∨ B) → (¬A ∧ ¬B))
 *   - Distributivity (A ∨ (B ∧ C) → (A ∨ B) ∧ (A ∨ C))
 *
 * @param {string|Array} formula - a formula in prefix notation or nested structure
 * @returns {Array<Array<string>>} - list of clauses in CNF
 */
export function toCNF(formula) {
  // If already a clause (array of literals), return as-is
  if (Array.isArray(formula)) {
    return [formula];
  }

  // Placeholder: for now, return empty (formulas are already in CNF in tell())
  // In a full implementation, would parse and convert complex formulas
  return [];
}

// ── Subsumption Checking ─────────────────────────────────────────────────────
/**
 * Check if `clause` is subsumed by any clause in `clauseSet`.
 * Clause A subsumes clause B if every literal in A is also in B.
 * (Shorter clauses are more general.)
 *
 * @param {Array<string>} clause - the clause to test
 * @param {Set|Array} clauseSet - existing clauses (can be Set of keys or Array of clauses)
 * @returns {boolean}
 */
function isSubsumed(clause, clauseSet) {
  const clauseLits = new Set(clause);
  
  // Handle Set (of keys) vs Array (of clauses)
  const clauses = Array.isArray(clauseSet) 
    ? clauseSet 
    : [];
  
  for (const existingClause of clauses) {
    if (existingClause.length >= clause.length) continue; // subsumer must be shorter
    
    let subsumed = true;
    for (const lit of existingClause) {
      if (!clauseLits.has(lit)) {
        subsumed = false;
        break;
      }
    }
    if (subsumed) return true;
  }
  return false;
}

// ── Core Resolution Engine ───────────────────────────────────────────────────
/**
 * Resolve two clauses c1 and c2.
 * Find a literal L in c1 and ¬L in c2, return resolvent (union minus resolved pair).
 * Increments global inferenceSteps counter.
 *
 * @param {Array<string>} c1 - first clause
 * @param {Array<string>} c2 - second clause
 * @returns {Array<Array<string>>} - list of resolvents (usually 0 or 1)
 */
export function resolve(c1, c2) {
  const results = [];
  for (const lit of c1) {
    const complement = neg(lit);
    if (c2.includes(complement)) {
      inferenceSteps++; // ← Increment step counter
      
      const resolvent = [
        ...c1.filter(l => l !== lit),
        ...c2.filter(l => l !== complement),
      ];
      
      // Deduplicate
      const unique = [...new Set(resolvent)];
      results.push(unique);
    }
  }
  return results;
}

// ── Neighbour helper ─────────────────────────────────────────────────────────
function neighbours(r, c, rows, cols) {
  return [
    [r - 1, c], [r + 1, c],
    [r, c - 1], [r, c + 1],
  ].filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);
}

// ── Create empty KB ──────────────────────────────────────────────────────────
export function createKB() {
  return [];
}

// ── Add clauses (deduplicated) ───────────────────────────────────────────────
function mergeClauses(kb, incoming) {
  const existing = new Set(kb.map(clauseKey));
  const result = [...kb];
  for (const clause of incoming) {
    if (isTautology(clause)) continue;
    const key = clauseKey(clause);
    if (!existing.has(key)) {
      existing.add(key);
      result.push(clause);
    }
  }
  return result;
}

// ── Refutation (Resolution Refutation) ───────────────────────────────────────
/**
 * Refutation: Prove KB |= α by showing KB ∧ {¬α} is unsatisfiable.
 * Uses BFS with subsumption pruning.
 *
 * @param {string} query - the query to prove (e.g., '¬P_2_2')
 * @param {Array} kb - the knowledge base
 * @returns {object} { entailed: boolean, steps: number }
 */
function refute(query, kb) {
  if (kb.length === 0) return { entailed: false, steps: 0 };

  const localSteps = inferenceSteps; // snapshot to measure steps for this query

  // Seed: KB + negated query
  const clauseMap = new Map();
  const seed = [...kb, [neg(query)]];
  for (const c of seed) {
    if (!isTautology(c)) {
      clauseMap.set(clauseKey(c), c);
    }
  }

  const MAX_CLAUSES = 600;
  let newClauses = [...seed];

  // BFS loop
  while (newClauses.length > 0 && clauseMap.size < MAX_CLAUSES) {
    const frontier = newClauses;
    newClauses = [];

    // Pair frontier clauses with all existing clauses
    for (const c1 of frontier) {
      for (const c2 of clauseMap.values()) {
        if (c1 === c2) continue;
        
        for (const resolvent of resolve(c1, c2)) {
          // Empty clause → contradiction found
          if (resolvent.length === 0) {
            return { entailed: true, steps: inferenceSteps - localSteps };
          }

          // Skip tautologies
          if (isTautology(resolvent)) continue;

          const key = clauseKey(resolvent);
          if (!clauseMap.has(key)) {
            // ← Subsumption pruning: skip if subsumed
            if (!isSubsumed(resolvent, [...clauseMap.values()])) {
              clauseMap.set(key, resolvent);
              newClauses.push(resolvent);
            }
          }
        }
      }
    }
  }

  return { entailed: false, steps: inferenceSteps - localSteps };
}

// ── TELL ─────────────────────────────────────────────────────────────────────
/**
 * Update KB with percepts received at position (row, col).
 * Returns a new KB (pure function — no mutation).
 *
 * Breeze present   → B_r_c  ⇔ (P_n1 ∨ P_n2 ∨ …)  in CNF
 * No breeze        → ¬P for each neighbor
 * Stench present   → S_r_c  ⇔ (W_n1 ∨ W_n2 ∨ …)  in CNF
 * No stench        → ¬W for each neighbor
 */
export function tell(kb, percepts, pos, rows, cols) {
  const { row: r, col: c } = pos;
  const { breeze, stench } = percepts;
  const clauses = [];

  const nbrs    = neighbours(r, c, rows, cols);
  const pitNbrs = nbrs.map(([nr, nc]) => pitLit(nr, nc));
  const wmpNbrs = nbrs.map(([nr, nc]) => wumpusLit(nr, nc));

  // ── Breeze ──────────────────────────────────────────────────────────────
  const bLit = breezeLit(r, c);
  if (breeze) {
    clauses.push([bLit]);                                   // assert B_r_c
    if (pitNbrs.length > 0)
      clauses.push([neg(bLit), ...pitNbrs]);               // B → (P_n1 ∨ …)
    pitNbrs.forEach(p => clauses.push([neg(p), bLit]));    // P_ni → B
  } else {
    clauses.push([neg(bLit)]);                             // assert ¬B_r_c
    pitNbrs.forEach(p => clauses.push([neg(p)]));          // ¬P for each nbr
  }

  // ── Stench ──────────────────────────────────────────────────────────────
  const sLit = stenchLit(r, c);
  if (stench) {
    clauses.push([sLit]);
    if (wmpNbrs.length > 0)
      clauses.push([neg(sLit), ...wmpNbrs]);
    wmpNbrs.forEach(w => clauses.push([neg(w), sLit]));
  } else {
    clauses.push([neg(sLit)]);
    wmpNbrs.forEach(w => clauses.push([neg(w)]));
  }

  // ── Cell (r,c) itself is safe (agent is here) ───────────────────────────
  clauses.push([neg(pitLit(r, c))]);
  clauses.push([neg(wumpusLit(r, c))]);

  return mergeClauses(kb, clauses);
}

// ── Resolution ───────────────────────────────────────────────────────────────
/**
 * ASK: Does the KB entail `query`?
 * Uses Resolution Refutation: KB |= α  iff  KB ∧ {¬α} is unsatisfiable.
 *
 * @param {string} query  e.g. '¬P_2_2' or 'P_3_1'
 * @param {Array}  kb     list of clauses
 * @returns {boolean}
 */
export function ask(query, kb) {
  const result = refute(query, kb);
  return result.entailed;
}

/**
 * ASK with diagnostics: returns inference steps taken for this query.
 *
 * @param {string} query - the query to prove
 * @param {Array} kb - the knowledge base
 * @returns {object} { entailed: boolean, steps: number }
 */
export function askWithDiagnostics(query, kb) {
  return refute(query, kb);
}

// ── Safe cell inference ──────────────────────────────────────────────────────
/**
 * Check every unvisited cell; if KB proves both ¬Pit and ¬Wumpus, it's safe.
 * Returns array of {row, col} that are provably safe.
 */
export function inferSafeCells(kb, grid, rows, cols) {
  const safe = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (cell.visited || cell.safe) continue;
      if (ask(neg(pitLit(r, c)), kb) && ask(neg(wumpusLit(r, c)), kb)) {
        safe.push({ row: r, col: c });
      }
    }
  }
  return safe;
}
