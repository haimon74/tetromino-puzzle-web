/* eslint-disable no-restricted-globals */
import { solveGeniusSquare } from './solverLogic';

// eslint-disable-next-line no-restricted-globals
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

self.onmessage = function(e) {
  const { blockers, pieces } = e.data;
  const solution = solveGeniusSquare(blockers, pieces);
  self.postMessage(solution);
}; 