import React from 'react';
import { PolyominoShape } from './PolyominoShape';
import styles from '../GeniusSquareGame.module.css';

type Coord = { row: number; col: number };
type Polyomino = { id: string; color: string; cells: Coord[] };

type PolyominoTrayProps = {
  pieces: Polyomino[];
  placed: { id: string }[];
  rotations: { [id: string]: Coord[] };
  selectedId: string | null;
  dragging: { id: string; grabbedCellIdx: number } | null;
  onSelect: (id: string) => void;
  onRotate: (id: string) => void;
  onDragStart: (id: string, fromBoard: boolean, e: React.DragEvent, grabbedCellIdx: number) => void;
  onDragEnd: () => void;
};

export const PolyominoTray = React.memo(function PolyominoTray({
  pieces, placed, rotations, selectedId, dragging, onSelect, onRotate, onDragStart, onDragEnd
}: PolyominoTrayProps) {
  return (
    <div className={styles.piecesArea}>
      {pieces.map(piece => {
        if (placed.find(p => p.id === piece.id)) return null;
        const cells = rotations[piece.id] || piece.cells;
        const isDragging = dragging && dragging.id === piece.id;
        // Calculate bounding box for tray alignment and sizing
        const minRow = Math.min(...cells.map(c => c.row));
        const minCol = Math.min(...cells.map(c => c.col));
        return (
          <div
            key={piece.id}
            className={`${styles.polyominoPiece} ${selectedId === piece.id && !isDragging ? styles.polyominoPieceSelected : ''}`}
            style={{
              borderColor: selectedId === piece.id && !isDragging ? 'purple' : 'transparent',
              padding: 8,
              boxSizing: 'content-box',
              display: 'inline-block',
            }}
            onClick={() => onSelect(piece.id)}
            draggable
            onDragStart={e => {
              // Find which cell is grabbed
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              const mouseX = e.clientX - rect.left;
              const mouseY = e.clientY - rect.top;
              let grabbedIdx = 0;
              for (let i = 0; i < cells.length; ++i) {
                const c = cells[i];
                const x = (c.col - minCol) * 60;
                const y = (c.row - minRow) * 60;
                if (
                  mouseX >= x && mouseX < x + 60 &&
                  mouseY >= y && mouseY < y + 60
                ) {
                  grabbedIdx = i;
                  break;
                }
              }
              onDragStart(piece.id, false, e, grabbedIdx);
            }}
            onDragEnd={onDragEnd}
          >
            <PolyominoShape
              cells={cells}
              color={piece.color}
              isSelected={selectedId === piece.id && !isDragging}
              isDragging={!!isDragging}
              showRotateBtn={selectedId === piece.id && !isDragging}
              onRotate={() => onRotate(piece.id)}
            />
          </div>
        );
      })}
    </div>
  );
}); 