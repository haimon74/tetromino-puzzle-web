// 9 unique polyomino shapes for The Genius Square
export const POLYOMINOES = [
  // 1. Single Square (Monomino)
  {
    id: 'Mono',
    cells: [ {row:0, col:0} ],
  },
  // 2. Domino
  {
    id: 'Domino',
    cells: [ {row:0, col:0}, {row:0, col:1} ],
  },
  // 3. Straight Triomino
  {
    id: 'Triomino-I',
    cells: [ {row:0, col:0}, {row:0, col:1}, {row:0, col:2} ],
  },
  // 4. L Triomino
  {
    id: 'Triomino-L',
    cells: [ {row:0, col:0}, {row:1, col:0}, {row:1, col:1} ],
  },
  // 5. Straight Tetromino (I)
  {
    id: 'Tetromino-I',
    cells: [ {row:0, col:0}, {row:0, col:1}, {row:0, col:2}, {row:0, col:3} ],
  },
  // 6. L Tetromino
  {
    id: 'Tetromino-L',
    cells: [ {row:0, col:0}, {row:1, col:0}, {row:2, col:0}, {row:2, col:1} ],
  },
  // 7. S Tetromino
  {
    id: 'Tetromino-S',
    cells: [ {row:0, col:1}, {row:0, col:2}, {row:1, col:0}, {row:1, col:1} ],
  },
  // 8. T Tetromino
  {
    id: 'Tetromino-T',
    cells: [ {row:0, col:0}, {row:0, col:1}, {row:0, col:2}, {row:1, col:1} ],
  },
  // 9. O Tetromino (Square)
  {
    id: 'Tetromino-O',
    cells: [ {row:0, col:0}, {row:0, col:1}, {row:1, col:0}, {row:1, col:1} ],
  },
]; 