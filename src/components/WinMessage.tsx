import React from 'react';
import styles from '../GeniusSquareGame.module.css';

export const WinMessage = React.memo(function WinMessage() {
  return <div className={styles.winMessage}>🎉 You solved it! 🎉</div>;
}); 