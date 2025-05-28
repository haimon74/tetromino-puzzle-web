import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './GeniusSquareGame.module.css';
import { BoardGrid } from './components/BoardGrid';
import { PolyominoTray } from './components/PolyominoTray';
import { TimerDisplay } from './components/TimerDisplay';
import { WinMessage } from './components/WinMessage';
import { ControlBar } from './components/ControlBar';
import { createSolverWorker as realCreateSolverWorker } from './solverWorkerFactory';
// import placeSound from './place-sound.mp3'; // Commented out for now
// @ts-ignore
const isTest = typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID !== undefined;

// Types for coordinates and pieces
type Coord = { row: number; col: number };
type Blocker = Coord;

// Board labels
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const COLS = [1, 2, 3, 4, 5, 6];

// Dice options for blockers
const DICE_OPTIONS: string[][] = [
  ['A1', 'C1', 'D1', 'D2', 'E2', 'F3'],
  ['A2', 'B2', 'C2', 'A3', 'B1', 'B3'],
  ['C3', 'D3', 'E3', 'B4', 'C4', 'D4'],
  ['E1', 'F2', 'F2', 'B6', 'A5', 'A5'],
  ['A4', 'B5', 'C6', 'C5', 'D6', 'F6'],
  ['E4', 'F4', 'E5', 'F5', 'D5', 'E6'],
  ['F1', 'F1', 'F1', 'A6', 'A6', 'A6'],
];

// Polyomino piece definitions (relative coordinates from origin)
export type Polyomino = {
  id: string;
  color: string;
  cells: Coord[]; // relative to origin (0,0)
};

// 9 unique shapes for The Genius Square (example shapes, can be adjusted for accuracy)
export const POLYOMINOES: Polyomino[] = [
  // 1. Single Square (Monomino)
  {
    id: 'Mono',
    color: '#e57373',
    cells: [ {row:0, col:0} ],
  },
  // 2. Domino
  {
    id: 'Domino',
    color: '#64b5f6',
    cells: [ {row:0, col:0}, {row:0, col:1} ],
  },
  // 3. Straight Triomino
  {
    id: 'Triomino-I',
    color: '#81c784',
    cells: [ {row:0, col:0}, {row:0, col:1}, {row:0, col:2} ],
  },
  // 4. L Triomino
  {
    id: 'Triomino-L',
    color: '#ffd54f',
    cells: [ {row:0, col:0}, {row:1, col:0}, {row:1, col:1} ],
  },
  // 5. Straight Tetromino (I)
  {
    id: 'Tetromino-I',
    color: '#ba68c8',
    cells: [ {row:0, col:0}, {row:0, col:1}, {row:0, col:2}, {row:0, col:3} ],
  },
  // 6. L Tetromino
  {
    id: 'Tetromino-L',
    color: '#ffb74d',
    cells: [ {row:0, col:0}, {row:1, col:0}, {row:2, col:0}, {row:2, col:1} ],
  },
  // 7. S Tetromino
  {
    id: 'Tetromino-S',
    color: '#4db6ac',
    cells: [ {row:0, col:1}, {row:0, col:2}, {row:1, col:0}, {row:1, col:1} ],
  },
  // 8. T Tetromino
  {
    id: 'Tetromino-T',
    color: '#a1887f',
    cells: [ {row:0, col:0}, {row:0, col:1}, {row:0, col:2}, {row:1, col:1} ],
  },
  // 9. O Tetromino (Square)
  {
    id: 'Tetromino-O',
    color: '#90caf9',
    cells: [ {row:0, col:0}, {row:0, col:1}, {row:1, col:0}, {row:1, col:1} ],
  },
];

// Convert label like 'A1' to Coord
function labelToCoord(label: string): Coord {
  const row = ROWS.indexOf(label[0]);
  const col = COLS.indexOf(Number(label[1]));
  return { row, col };
}

// Generate 7 unique blocker positions
function generateBlockers(): Blocker[] {
  const blockers: Blocker[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 7; i++) {
    let coord: Coord;
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

function rotateCells(cells: Coord[]): Coord[] {
  // Rotate 90deg clockwise around (0,0)
  return cells.map(({ row, col }) => ({ row: col, col: -row }));
}

function getBoundingBox(cells: Coord[]): { minRow: number, minCol: number } {
  let minRow = Math.min(...cells.map(c => c.row));
  let minCol = Math.min(...cells.map(c => c.col));
  return { minRow, minCol };
}

function normalizeCells(cells: Coord[]): Coord[] {
  // Shift so top-left is (0,0)
  const { minRow, minCol } = getBoundingBox(cells);
  return cells.map(({ row, col }) => ({ row: row - minRow, col: col - minCol }));
}

function randomizeArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type PlacedPiece = {
  id: string;
  origin: Coord; // top-left cell on board
  rotation: Coord[]; // current rotation
};

function cellsToBoardCoords(origin: Coord, cells: Coord[]): Coord[] {
  return cells.map(cell => ({ row: origin.row + cell.row, col: origin.col + cell.col }));
}

function isValidPlacement(
  origin: Coord,
  cells: Coord[],
  blockers: Blocker[],
  placed: PlacedPiece[],
  id: string
): boolean {
  const boardCells = cellsToBoardCoords(origin, cells);
  // Check bounds
  if (boardCells.some(c => c.row < 0 || c.row > 5 || c.col < 0 || c.col > 5)) return false;
  // Check blockers
  if (boardCells.some(c => blockers.some(b => b.row === c.row && b.col === c.col))) return false;
  // Check overlap with other pieces
  for (const piece of placed) {
    if (piece.id === id) continue;
    const otherCells = cellsToBoardCoords(piece.origin, piece.rotation);
    if (boardCells.some(c => otherCells.some(o => o.row === c.row && o.col === c.col))) return false;
  }
  return true;
}

// Helper to create a drag image for a polyomino
function createPolyominoDragImage(cells: Coord[], color: string, grabbedIdx: number, blockSize = 60) {
  // Find bounding box
  const minRow = Math.min(...cells.map(c => c.row));
  const minCol = Math.min(...cells.map(c => c.col));
  const maxRow = Math.max(...cells.map(c => c.row));
  const maxCol = Math.max(...cells.map(c => c.col));
  const w = (maxCol - minCol + 1) * blockSize;
  const h = (maxRow - minRow + 1) * blockSize;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < cells.length; ++i) {
      const c = cells[i];
      ctx.fillStyle = color;
      ctx.strokeStyle = '#3332';
      ctx.lineWidth = 2;
      ctx.fillRect((c.col - minCol) * blockSize, (c.row - minRow) * blockSize, blockSize, blockSize);
      ctx.strokeRect((c.col - minCol) * blockSize, (c.row - minRow) * blockSize, blockSize, blockSize);
      if (i === grabbedIdx) {
        ctx.save();
        ctx.strokeStyle = '#7c4dff';
        ctx.lineWidth = 3;
        ctx.strokeRect((c.col - minCol) * blockSize + 2, (c.row - minRow) * blockSize + 2, blockSize - 4, blockSize - 4);
        ctx.restore();
      }
    }
  }
  // For Firefox compatibility, append to DOM off-screen
  canvas.style.position = 'absolute';
  canvas.style.left = '-9999px';
  document.body.appendChild(canvas);
  setTimeout(() => {
    try { document.body.removeChild(canvas); } catch {}
  }, 1000);
  // Offset so the grabbed cell is under the cursor
  const grabbed = cells[grabbedIdx];
  const offsetX = ((grabbed.col - minCol) + 0.5) * blockSize;
  const offsetY = ((grabbed.row - minRow) + 0.5) * blockSize;
  return { img: canvas, offsetX, offsetY };
}

// Helper to format timer as mm:ss
function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const createSolverWorker = () => {
  if (isTest) {
    // Return a dummy worker in test, typed as Worker
    return {
      postMessage: () => {},
      terminate: () => {},
      onmessage: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      onerror: null,
      onmessageerror: null,
      // @ts-ignore
      CLOSED: 0, CLOSING: 0, CONNECTING: 0, OPEN: 0, readyState: 0, url: '',
    } as unknown as Worker;
  }
  return realCreateSolverWorker();
};

const GeniusSquareGame: React.FC = () => {
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [pieces, setPieces] = useState(() => randomizeArray(POLYOMINOES));
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [rotations, setRotations] = useState<{[id:string]: Coord[]}>({});
  const [placed, setPlaced] = useState<PlacedPiece[]>([]);
  const [dragging, setDragging] = useState<{id: string, grabbedCellIdx: number}|null>(null);
  const [win, setWin] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout|null>(null);
  const [showingSolution, setShowingSolution] = useState(false);
  const [userPlacedBackup, setUserPlacedBackup] = useState<PlacedPiece[]|null>(null);
  const [solutionCache, setSolutionCache] = useState<PlacedPiece[]|null>(null);
  const workerRef = useRef<Worker|null>(null);

  // Timer effect
  useEffect(() => {
    if (win) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    // Only start timer if timer > 0 (i.e., after New Game)
    if (timer > 0 && !win) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      };
    }
  }, [win, timer]);

  // Reset timer and start only on new game
  const handleNewGame = () => {
    const blockers = generateBlockers();
    setBlockers(blockers);
    setPieces(randomizeArray(POLYOMINOES));
    setSelectedId(null);
    setRotations({});
    setPlaced([]);
    setDragging(null);
    setWin(false);
    setTimer(1);
    setSolutionCache(null);
    const oldWorker = workerRef.current;
    if (oldWorker) oldWorker.terminate();
    const worker = createSolverWorker();
    workerRef.current = worker;
    worker.postMessage({ blockers, pieces: POLYOMINOES.map(({id, cells}) => ({id, cells})) });
    worker.onmessage = (e: MessageEvent) => {
      setSolutionCache(e.data);
    };
  };

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleRotate = useCallback((id: string) => {
    setRotations(prev => {
      const orig = pieces.find(p => p.id === id)?.cells || [];
      const current = prev[id] || orig;
      const rotated = normalizeCells(rotateCells(current));
      return { ...prev, [id]: rotated };
    });
  }, [pieces]);

  // Drag start from tray or board
  const handleDragStart = (id: string, fromBoard: boolean, e: React.DragEvent, grabbedCellIdx = 0) => {
    setSelectedId(id);
    setDragging({ id, grabbedCellIdx });
    e.dataTransfer.effectAllowed = 'move';
  };

  // Drag over board cell
  const handleDragOver = (row: number, col: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Drop on board cell
  const handleDrop = (row: number, col: number, e: React.DragEvent) => {
    e.preventDefault();
    if (!dragging) return;
    const { id, grabbedCellIdx } = dragging;
    const piece = pieces.find(p => p.id === id);
    if (!piece) return;
    const cells = rotations[id] || piece.cells;
    const grabbedCell = cells[grabbedCellIdx] || cells[0];
    const origin = { row: row - grabbedCell.row, col: col - grabbedCell.col };
    // LOGGING for debugging
    console.log('--- handleDrop ---');
    console.log('dragging:', dragging);
    console.log('grabbedCellIdx:', grabbedCellIdx);
    console.log('cells:', cells);
    console.log('grabbedCell:', grabbedCell);
    console.log('drop row,col:', row, col);
    console.log('calculated origin:', origin);
    if (!isValidPlacement(origin, cells, blockers, placed, id)) {
      console.log('Invalid placement');
      return;
    }
    setPlaced(prev => {
      const newPlaced = [
        ...prev.filter(p => p.id !== id),
        { id, origin, rotation: cells }
      ];
      console.log('newPlaced:', newPlaced);
      return newPlaced;
    });
    setDragging(null);
    // Play sound
    // const audio = new Audio(placeSound);
    // audio.play();
    // Check win
    setTimeout(() => {
      const allPlaced = pieces.every(p =>
        placed.find(pp => pp.id === p.id) || p.id === id // include just-placed
      );
      if (allPlaced) {
        // Check if all board cells (except blockers) are covered
        let covered = Array.from({ length: 6 }, () => Array(6).fill(false));
        for (const pp of [...placed.filter(p => p.id !== id), { id, origin, rotation: cells }]) {
          for (const c of cellsToBoardCoords(pp.origin, pp.rotation)) {
            covered[c.row][c.col] = true;
          }
        }
        let win = true;
        for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
          if (blockers.some(b => b.row === r && b.col === c)) continue;
          if (!covered[r][c]) win = false;
        }
        setWin(win);
      }
    }, 100);
  };

  // Remove piece from board (double click)
  const handleRemoveFromBoard = (id: string) => {
    setPlaced(prev => prev.filter(p => p.id !== id));
  };

  // Memoized derived data
  const trayPieces = React.useMemo(() => pieces, [pieces]);

  // Memoized event handlers
  const memoHandleSelect = useCallback(handleSelect, [handleSelect]);
  const memoHandleRotate = useCallback(handleRotate, [handleRotate]);
  const memoHandleDragStart = useCallback(handleDragStart, [handleDragStart]);
  const memoHandleDragEnd = useCallback(() => setDragging(null), []);
  const memoHandleDrop = useCallback(handleDrop, [handleDrop, dragging, pieces, rotations, blockers, placed]);
  const memoHandleRemoveFromBoard = useCallback(handleRemoveFromBoard, [handleRemoveFromBoard]);

  return (
    <div className={styles.geniusSquareGame}>
      <h1>Blocks Puzzle</h1>
      <ControlBar
        onNewGame={handleNewGame}
        onShowSolution={() => {
          if (showingSolution) {
            if (userPlacedBackup) setPlaced(userPlacedBackup);
            setShowingSolution(false);
          } else {
            setUserPlacedBackup(placed);
            if (solutionCache) {
              setPlaced(solutionCache);
              setShowingSolution(true);
            } else {
              alert('Solution is still being calculated. Please wait.');
            }
          }
        }}
        timer={timer}
        solutionAvailable={!!solutionCache}
        showingSolution={showingSolution}
      />
      {win && <WinMessage />}
      <BoardGrid
        blockers={blockers}
        placed={placed}
        pieces={pieces}
        onCellDrop={memoHandleDrop}
        onPieceDragStart={memoHandleDragStart}
        onPieceDoubleClick={memoHandleRemoveFromBoard}
      />
      <PolyominoTray
        pieces={trayPieces}
        placed={placed}
        rotations={rotations}
        selectedId={selectedId}
        dragging={dragging}
        onSelect={memoHandleSelect}
        onRotate={memoHandleRotate}
        onDragStart={memoHandleDragStart}
        onDragEnd={memoHandleDragEnd}
      />
    </div>
  );
};

export default GeniusSquareGame;