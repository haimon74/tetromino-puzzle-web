import React from 'react';
import { TimerDisplay } from './TimerDisplay';
import styles from '../GeniusSquareGame.module.css';

type ControlBarProps = {
  onNewGame: () => void;
  onShowSolution: () => void;
  timer: number;
  solutionAvailable: boolean;
  showingSolution: boolean;
};

export const ControlBar = React.memo(function ControlBar({
  onNewGame, onShowSolution, timer, solutionAvailable, showingSolution
}: ControlBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '8px' }}>
      <button className={styles.newGameBtn} onClick={onNewGame}>New Game</button>
      <TimerDisplay timer={timer} />
      <button
        className={`${styles.solutionToggleBtn}${showingSolution ? ' ' + styles.active : ''}`}
        title={showingSolution ? 'Back to my game' : 'Show solution'}
        disabled={!solutionAvailable}
        onClick={onShowSolution}
      >
        💡
      </button>
    </div>
  );
}); 