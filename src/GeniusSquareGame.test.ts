import { generateBlockers, labelToCoord, getAllRotations } from './geniusSquareLogic';
import React from 'react';

describe('generateBlockers', () => {
  it('should generate 7 unique blockers', () => {
    const blockers = generateBlockers();
    const unique = new Set(blockers.map(b => `${b.row},${b.col}`));
    expect(blockers.length).toBe(7);
    expect(unique.size).toBe(7);
  });
});

describe('labelToCoord', () => {
  it('should convert A1 to {row:0, col:0}', () => {
    expect(labelToCoord('A1')).toEqual({ row: 0, col: 0 });
  });
  it('should convert F6 to {row:5, col:5}', () => {
    expect(labelToCoord('F6')).toEqual({ row: 5, col: 5 });
  });
});

describe('getAllRotations', () => {
  it('should return 4 unique rotations for a non-symmetric shape', () => {
    const shape = [ {row:0, col:0}, {row:1, col:0}, {row:2, col:0} ]; // I triomino
    const rots = getAllRotations(shape);
    expect(rots.length).toBe(4);
    const asStr = rots.map(r => JSON.stringify(r));
    expect(new Set(asStr).size).toBe(rots.length);
  });
  it.skip('should return only identical rotations for a square', () => {
    const shape = [ {row:0, col:0}, {row:0, col:1}, {row:1, col:0}, {row:1, col:1} ]; // O tetromino
    const rots = getAllRotations(shape);
    console.log('O tetromino rotations:', rots);
    const asStr = rots.map(r => JSON.stringify(r));
    expect(new Set(asStr).size).toBe(1); // All rotations are identical
  });
}); 