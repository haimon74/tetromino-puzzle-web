// Pure logic for Genius Square

export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const COLS = [1, 2, 3, 4, 5, 6];

export const DICE_OPTIONS: string[][] = [
  ['A1', 'C1', 'D1', 'D2', 'E2', 'F3'],
  ['A2', 'B2', 'C2', 'A3', 'B1', 'B3'],
  ['C3', 'D3', 'E3', 'B4', 'C4', 'D4'],
  ['E1', 'F2', 'F2', 'B6', 'A5', 'A5'],
  ['A4', 'B5', 'C6', 'C5', 'D6', 'F6'],
  ['E4', 'F4', 'E5', 'F5', 'D5', 'E6'],
  ['F1', 'F1', 'F1', 'A6', 'A6', 'A6'],
];

export function labelToCoord(label: string) {
  const row = ROWS.indexOf(label[0]);
  const col = COLS.indexOf(Number(label[1]));
  return { row, col };
}

export function generateBlockers() {
  const blockers: { row: number; col: number }[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 7; i++) {
    let coord: { row: number; col: number };
    let label: string;
    do {
      const option = DICE_OPTIONS[i][Math.floor(Math.random() * 6)];
      label = option;
      coord = labelToCoord(option);
    } while (used.has(label));
    used.add(label);
    blockers.push(coord);
  }
  return blockers;
}

export function rotateCells(cells: { row: number; col: number }[]) {
  return cells.map(({ row, col }) => ({ row: col, col: -row }));
}

export function getBoundingBox(cells: { row: number; col: number }[]) {
  let minRow = Math.min(...cells.map(c => c.row));
  let minCol = Math.min(...cells.map(c => c.col));
  return { minRow, minCol };
}

export function normalizeCells(cells: { row: number; col: number }[]) {
  const { minRow, minCol } = getBoundingBox(cells);
  return cells.map(({ row, col }) => ({ row: row - minRow, col: col - minCol }));
}

export function getAllRotations(cells: { row: number; col: number }[]) {
  const rotations: { row: number; col: number }[][] = [];
  let cur = normalizeCells(cells);
  for (let i = 0; i < 4; ++i) {
    const key = JSON.stringify(cur);
    if (rotations.some(r => JSON.stringify(r) === key)) {
      break; // All further rotations will be the same
    }
    rotations.push(cur);
    cur = normalizeCells(rotateCells(cur));
  }
  return rotations;
} 