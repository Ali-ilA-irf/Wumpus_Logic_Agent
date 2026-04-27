# Resolution Engine Implementation Guide

## Overview

The Wumpus World agent uses **Resolution Refutation** to perform logical inference on a Conjunctive Normal Form (CNF) Knowledge Base. This document details the complete implementation.

---

## 1. CNF Representation

All clauses are stored as **arrays of literal strings**:

```javascript
// Clause: (¬P_1_1 ∨ B_1_1 ∨ W_2_2)
const clause = ['¬P_1_1', 'B_1_1', 'W_2_2'];

// Clause: (P_2_1)  ← unit clause
const unitClause = ['P_2_1'];

// Empty clause: contradiction detected
const contradiction = [];
```

**Literal Naming Conventions:**
- `P_r_c` = Pit at (row, col)
- `W_r_c` = Wumpus at (row, col)
- `B_r_c` = Breeze at (row, col)
- `S_r_c` = Stench at (row, col)
- `¬` prefix = negation

---

## 2. toCNF(formula)

Converts logical formulas to CNF. Currently a placeholder as the `tell()` function already generates clauses in CNF.

**Future capabilities:**
```javascript
// Biconditional: A ⇔ B  →  (¬A ∨ B) ∧ (A ∨ ¬B)
toCNF(['⇔', 'A', 'B']) 
  → [['¬A', 'B'], ['A', '¬B']]

// Implication: A → B  →  (¬A ∨ B)
toCNF(['→', 'A', 'B']) 
  → [['¬A', 'B']]

// De Morgan: ¬(A ∨ B)  →  (¬A ∧ ¬B)
toCNF(['¬', ['∨', 'A', 'B']]) 
  → [['¬A'], ['¬B']]
```

---

## 3. resolve(c1, c2) → Resolvent

The core inference operator. Finds a literal that appears in one clause and its negation in the other.

```javascript
import { resolve } from './engine/kb';

const c1 = ['¬P_1_1', 'B_1_1'];     // ¬P_1_1 ∨ B_1_1
const c2 = ['P_1_1', 'W_2_2'];      // P_1_1 ∨ W_2_2

const resolvents = resolve(c1, c2);
// resolvents = [['B_1_1', 'W_2_2']]  ← B_1_1 ∨ W_2_2

// Each call increments global inferenceSteps counter
```

**How it works:**
1. For each literal L in c1, check if ¬L is in c2
2. If found, create resolvent = (c1 \ {L}) ∪ (c2 \ {¬L})
3. Deduplicate and return

**Contradiction Detection:**
```javascript
const c1 = ['P_1_1'];              // P_1_1
const c2 = ['¬P_1_1'];             // ¬P_1_1

const resolvents = resolve(c1, c2);
// resolvents = [[]]  ← Empty clause = contradiction!
```

---

## 4. Subsumption Pruning

A clause A **subsumes** clause B if A ⊆ B (A's literals are a subset of B's).

```javascript
const clauseA = ['P_1_1', 'B_2_2'];     // Shorter
const clauseB = ['P_1_1', 'B_2_2', 'W_3_3'];  // Longer

// A subsumes B because {P_1_1, B_2_2} ⊂ {P_1_1, B_2_2, W_3_3}
isSubsumed(clauseB, [...kb]);  // true → skip adding B
```

**Why it matters:**
- Removes redundant clauses (more specific than general clauses)
- Keeps KB compact
- Prevents exponential blowup during resolution

---

## 5. refute(query, kb) → { entailed, steps }

**Resolution Refutation Algorithm:**

To prove KB ⊨ Q:
1. Negate Q to get ¬Q
2. Add {¬Q} to KB
3. Try to derive contradiction (empty clause)
4. If contradiction found → Q is entailed
5. If no new clauses → Q cannot be proven

**BFS Frontier Expansion:**
```
Iteration 0:  Clauses = KB ∪ {¬Q}
Iteration 1:  Pair frontier clauses with ALL existing clauses
              → Collect new resolvents (frontier for next round)
Iteration 2:  Pair new frontier with all clauses
              → Continue until [] found or no new clauses
```

```javascript
import { resetInferenceSteps, askWithDiagnostics } from './engine/kb';

resetInferenceSteps();
const result = askWithDiagnostics('¬P_1_1', kb);

console.log(result);
// { entailed: true, steps: 7 }
```

---

## 6. Inference Step Counter

Every call to `resolve()` increments a global counter:

```javascript
import { getInferenceSteps, resetInferenceSteps } from './engine/kb';

resetInferenceSteps();
ask('¬P_1_1', kb);
console.log(getInferenceSteps());  // e.g., 12

resetInferenceSteps();
ask('¬W_2_2', kb);
console.log(getInferenceSteps());  // e.g., 8
```

**Use Cases:**
- **Performance profiling:** Which queries require most inference?
- **Debugging:** Identify problematic clauses causing search explosion
- **Display:** Show user how hard the query was to prove

---

## 7. Integration with Game Loop

### tell() — Add Percepts to KB

```javascript
import { tell } from './engine/kb';

const percepts = { breeze: true, stench: false };
const pos = { row: 1, col: 1 };

let kb = [];
kb = tell(kb, percepts, pos, 4, 4);
// kb now contains clauses encoding:
//   - B_1_1 is true
//   - No wumpus at adjacent cells (since stench=false)
```

### ask() — Query the KB

```javascript
import { ask } from './engine/kb';

const isSafe = ask('¬P_2_2', kb);  // Is cell (2,2) free of pits?
if (isSafe) agentMove(2, 2);
```

### Metrics Dashboard

The KBPanel component displays:
- **Total Clauses:** Current size of KB
- **Inference Steps:** Cumulative resolutions performed
- **Query Results:** Per-query step count

---

## 8. Example Walkthrough

**Setup:**
```
Grid: 2×2
Agent at (0,0): breeze detected
Neighbors: (0,1), (1,0)
```

**KB After tell():**
```
1. B_0_0                    ← Breeze percept
2. ¬B_0_0 ∨ P_0_1 ∨ P_1_0  ← Biconditional: B ⇔ (P_neighbor)
3. ¬P_0_1 ∨ B_0_0          ← Implication: P → B
4. ¬P_1_0 ∨ B_0_0
5. ¬P_0_0                   ← Agent's cell is safe
6. ¬W_0_0
```

**Query: "Is (0,1) free of pits?"**
- Query: `¬P_0_1`
- Negate: `P_0_1`
- Refutation:
  - Start: KB ∪ {P_0_1}
  - Resolve clause 1 (B_0_0) with clause 2:
    - Get: P_0_1 ∨ P_1_0
  - Resolve new clause with clause 4:
    - Get: P_0_1 ∨ B_0_0
  - Continue until contradiction (or no new clauses)

---

## 9. Performance Optimizations

| Optimization | Benefit |
|---|---|
| **Subsumption pruning** | Removes redundant clauses; keeps KB compact |
| **Tautology filtering** | Skips unsatisfiable clauses |
| **Deduplication (clauseKey)** | Prevents duplicate clauses in KB |
| **BFS frontier** | Systematic expansion; early contradiction detection |
| **MAX_CLAUSES cap** | Prevents infinite loops; safety bound |

---

## 10. Key Functions Reference

### kb.js exports:

| Function | Signature | Returns |
|---|---|---|
| `toCNF(formula)` | (string\|Array) → Array | CNF clauses |
| `resolve(c1, c2)` | (Array, Array) → Array | Resolvents |
| `ask(query, kb)` | (string, Array) → boolean | Entailed? |
| `askWithDiagnostics(query, kb)` | (string, Array) → Object | {entailed, steps} |
| `getInferenceSteps()` | () → number | Step count |
| `resetInferenceSteps()` | () → void | Resets counter |
| `tell(kb, percepts, pos, rows, cols)` | ... → Array | Updated KB |
| `inferSafeCells(kb, grid, rows, cols)` | ... → Array | Safe {row,col} cells |

---

## 11. Testing

```javascript
// Test 1: Basic resolution
const c1 = ['¬P', 'Q'];
const c2 = ['P', 'R'];
const res = resolve(c1, c2);
console.assert(res[0].includes('Q') && res[0].includes('R'));

// Test 2: Contradiction detection
const ca = ['P'];
const cb = ['¬P'];
const res2 = resolve(ca, cb);
console.assert(res2[0].length === 0);  // Empty clause

// Test 3: Refutation
const kb = [
  ['¬P', 'Q'],
  ['P'],
  ['¬Q', 'R']
];
resetInferenceSteps();
const entailed = ask('R', kb);
console.assert(entailed === true);
console.log(`Took ${getInferenceSteps()} steps`);
```

---

**End of Implementation Guide**
