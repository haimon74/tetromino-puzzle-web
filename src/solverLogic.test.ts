import { solveGeniusSquare } from './solverLogic';
import { POLYOMINOES } from './polyominoes';
import { generateBlockers } from './geniusSquareLogic';

describe('solveGeniusSquare', () => {
  it('finds a solution for a valid random board', () => {
    const blockers = generateBlockers();
    const pieces = POLYOMINOES;
    const solution = solveGeniusSquare(blockers, pieces);
    expect(solution).not.toBeNull();
    if (solution) {
      expect(solution.length).toBe(pieces.length);
    }
  });

  it('returns null for an impossible board', () => {
    // Block all cells so no solution is possible
    const blockers = [];
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) blockers.push({ row: r, col: c });
    const pieces = POLYOMINOES;
    const solution = solveGeniusSquare(blockers, pieces);
    expect(solution).toBeNull();
  });
}); 