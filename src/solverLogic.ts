// Pure solver logic for Genius Square
// Type definitions
export type Coord = { row: number; col: number };
export type Piece = { id: string; cells: Coord[] };
export type PlacedPiece = { id: string; origin: Coord; rotation: Coord[] };

export function rotateCells(cells: Coord[]): Coord[] {
  return cells.map(({ row, col }) => ({ row: col, col: -row }));
}
export function getBoundingBox(cells: Coord[]): { minRow: number; minCol: number } {
  let minRow = Math.min(...cells.map((c: Coord) => c.row));
  let minCol = Math.min(...cells.map((c: Coord) => c.col));
  return { minRow, minCol };
}
export function normalizeCells(cells: Coord[]): Coord[] {
  const { minRow, minCol } = getBoundingBox(cells);
  return cells.map(({ row, col }: Coord) => ({ row: row - minRow, col: col - minCol }));
}
export function getAllRotations(cells: Coord[]): Coord[][] {
  const seen = new Set<string>();
  const rotations: Coord[][] = [];
  let cur = normalizeCells(cells);
  for (let i = 0; i < 4; ++i) {
    // Sort cells for canonical representation
    const sorted = [...cur].sort((a, b) => a.row - b.row || a.col - b.col);
    // console.log(sorted)
    const key = JSON.stringify(sorted);
    // console.log(key);
    if (!seen.has(key)) {        
      seen.add(key);
      rotations.push(sorted);
    }
    cur = normalizeCells(rotateCells(cur));
  }
  return rotations;
}
export function solveGeniusSquare(blockers: Coord[], pieces: Piece[]): PlacedPiece[] | null {
  const board = Array.from({ length: 6 }, () => Array(6).fill(null));
  for (const b of blockers) board[b.row][b.col] = 'block';
  function canPlace(origin: Coord, cells: Coord[], id: string): boolean {
    for (const c of cells) {
      const r = origin.row + c.row;
      const col = origin.col + c.col;
      if (r < 0 || r > 5 || col < 0 || col > 5) return false;
      if (board[r][col]) return false;
    }
    return true;
  }
  function place(origin: Coord, cells: Coord[], id: string): void {
    for (const c of cells) {
      board[origin.row + c.row][origin.col + c.col] = id;
    }
  }
  function unplace(origin: Coord, cells: Coord[]): void {
    for (const c of cells) {
      board[origin.row + c.row][origin.col + c.col] = null;
    }
  }
  const result: PlacedPiece[] = [];
  function backtrack(idx: number): boolean {
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