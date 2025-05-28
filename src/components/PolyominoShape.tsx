import React from 'react';
import styles from '../GeniusSquareGame.module.css';

type Coord = { row: number; col: number };

type PolyominoShapeProps = {
  cells: Coord[];
  color: string;
  isSelected?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDoubleClick?: () => void;
  showRotateBtn?: boolean;
  onRotate?: () => void;
};

export const PolyominoShape = React.memo(function PolyominoShape({
  cells,
  color,
  isSelected = false,
  isDragging = false,
  onClick,
  onDragStart,
  onDragEnd,
  onDoubleClick,
  showRotateBtn = false,
  onRotate,
}: PolyominoShapeProps) {
  // Calculate bounding box for alignment and sizing
  const minRow = Math.min(...cells.map(c => c.row));
  const minCol = Math.min(...cells.map(c => c.col));
  const maxRow = Math.max(...cells.map(c => c.row));
  const maxCol = Math.max(...cells.map(c => c.col));
  const shapeWidth = (maxCol - minCol + 1) * 60;
  const shapeHeight = (maxRow - minRow + 1) * 60;
  return (
    <div
      className={styles.polyominoCells}
      style={{
        width: shapeWidth,
        height: shapeHeight,
        position: 'relative',
        // border: isSelected && !isDragging ? '2px solid purple' : 'none',
        opacity: isDragging ? 0.5 : 1,
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDoubleClick={onDoubleClick}
    >
      {cells.map((cell, idx) => (
        <div
          key={idx}
          className={styles.polyominoCell}
          style={{
            background: color,
            left: `${(cell.col - minCol) * 60}px`,
            top: `${(cell.row - minRow) * 60}px`,
          }}
        />
      ))}
      {showRotateBtn && onRotate && (
        <button className={styles.rotateBtn} onClick={e => { e.stopPropagation(); onRotate(); }}>
          &#8635;
        </button>
      )}
    </div>
  );
}); 