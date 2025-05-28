// Pure solver logic for Genius Square Worker

function rotateCells(cells) {
  return cells.map(({ row, col }) => ({ row: col, col: -row }));
}
function getBoundingBox(cells) {
  let minRow = Math.min(...cells.map(c => c.row));
  let minCol = Math.min(...cells.map(c => c.col));
  return { minRow, minCol };
}
function normalizeCells(cells) {
  const { minRow, minCol } = getBoundingBox(cells);
  return cells.map(({ row, col }) => ({ row: row - minRow, col: col - minCol }));
}
function getAllRotations(cells) {
  const seen = new Set();
  const rotations = [];
  let cur = normalizeCells(cells);
  for (let i = 0; i < 4; ++i) {
    const sorted = [...cur].sort((a, b) => a.row - b.row || a.col - b.col);
    const key = JSON.stringify(sorted);
    if (!seen.has(key)) {
      seen.add(key);
      rotations.push(sorted);
    }
    cur = normalizeCells(rotateCells(cur));
  }
  return rotations;
}
function solveGeniusSquare(blockers, pieces) {
  const board = Array.from({ length: 6 }, () => Array(6).fill(null));
  for (const b of blockers) board[b.row][b.col] = 'block';
  function canPlace(origin, cells, id) {
    for (const c of cells) {
      const r = origin.row + c.row;
      const col = origin.col + c.col;
      if (r < 0 || r > 5 || col < 0 || col > 5) return false;
      if (board[r][col]) return false;
    }
    return true;
  }
  function place(origin, cells, id) {
    for (const c of cells) {
      board[origin.row + c.row][origin.col + c.col] = id;
    }
  }
  function unplace(origin, cells) {
    for (const c of cells) {
      board[origin.row + c.row][origin.col + c.col] = null;
    }
  }
  const result = [];
  function backtrack(idx) {
    if (idx === pieces.length) return true;
    const piece = pieces[idx];
    const rotations = getAllRotations(piece.cells);
    for (const rot of rotations) {
      for (let r = 0; r < 6; ++r) {
        for (let c = 0; c < 6; ++c) {
          const origin = { row: r, col: c };
          if (canPlace(origin, rot, piece.id)) {
            place(origin, rot, piece.id);
            result.push({ id: piece.id, origin, rotation: rot });
            if (backtrack(idx + 1)) return true;
            result.pop();
            unplace(origin, rot);
          }
        }
      }
    }
    return false;
  }
  if (backtrack(0)) return [...result];
  return null;
}

self.onmessage = function(e) {
  const { blockers, pieces } = e.data;
  const solution = solveGeniusSquare(blockers, pieces);
  self.postMessage(solution);
}; 

// export const createSolverWorker = () => new Worker(`${process.env.PUBLIC_URL}/solverWorker.js`);