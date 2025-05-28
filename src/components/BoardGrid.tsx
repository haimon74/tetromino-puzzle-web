import React, { useEffect } from 'react';
import styles from '../GeniusSquareGame.module.css';
import { PolyominoShape } from './PolyominoShape';

type Coord = { row: number; col: number };
type PlacedPiece = { id: string; origin: Coord; rotation: Coord[] };

type BoardGridProps = {
  blockers: Coord[];
  placed: PlacedPiece[];
  pieces: { id: string; color: string }[];
  onCellDrop: (row: number, col: number, e: React.DragEvent) => void;
  onPieceDragStart: (id: string, fromBoard: boolean, e: React.DragEvent, grabbedCellIdx: number) => void;
  onPieceDoubleClick: (id: string) => void;
};

export const BoardGrid = React.memo(function BoardGrid({ blockers, placed, pieces, onCellDrop, onPieceDragStart, onPieceDoubleClick }: BoardGridProps) {
  const ROWS = [0, 1, 2, 3, 4, 5];
  const COLS = [0, 1, 2, 3, 4, 5];
  
  useEffect(() => {
  // Debug log: print absolute positions of all placed cells
  placed.forEach(pp => {
    pp.rotation.forEach(cell => {
      // eslint-disable-next-line no-console
      console.log('Placed', pp.id, 'at', pp.origin.row + cell.row, pp.origin.col + cell.col);
    });
    });
  }, [placed]);

  return (
    <div
      className={styles.boardGrid}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 60px)',
        gridTemplateRows: 'repeat(6, 60px)',
        alignItems: 'center',
        justifyItems: 'center',
        margin: '0 auto',
        position: 'relative',
        width: 360,
        height: 360,
      }}
    >
      {ROWS.map(rowIdx =>
        COLS.map(colIdx => {
          const isBlocker = blockers.some(b => b.row === rowIdx && b.col === colIdx);
          return (
            <div
              key={`cell-${rowIdx}-${colIdx}`}
              className={`${styles.cell}${isBlocker ? ' ' + styles.cellBlocker : ''}`}
              style={{ gridColumn: colIdx + 1, gridRow: rowIdx + 1 }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => onCellDrop(rowIdx, colIdx, e)}
            >
              {isBlocker && <span className={styles.blockerDot} />}
            </div>
          );
        })
      )}
      {placed.map(pp => {
        const color = pieces.find(p => p.id === pp.id)?.color || '#ccc';
        const minRow = Math.min(...pp.rotation.map(c => c.row));
        const minCol = Math.min(...pp.rotation.map(c => c.col));
        const top = (pp.origin.row + minRow) * 60;
        const left = (pp.origin.col + minCol) * 60;
        return (
          <div
            key={pp.id}
            style={{
              position: 'absolute',
              top,
              left,
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <PolyominoShape
              cells={pp.rotation}
              color={color}
              isSelected={false}
              isDragging={false}
              onDragStart={e => onPieceDragStart(pp.id, true, e, 0)}
              onDoubleClick={() => onPieceDoubleClick(pp.id)}
            />
          </div>
        );
      })}
    </div>
  );
}); 