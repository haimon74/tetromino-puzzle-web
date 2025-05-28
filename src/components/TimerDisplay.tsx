import React from 'react';

type TimerDisplayProps = { timer: number };

export const TimerDisplay = React.memo(function TimerDisplay({ timer }: TimerDisplayProps) {
  const m = Math.floor(timer / 60).toString().padStart(2, '0');
  const s = (timer % 60).toString().padStart(2, '0');
  return <span>⏱️ {m}:{s}</span>;
}); 