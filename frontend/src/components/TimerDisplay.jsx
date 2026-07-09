import { useEffect, useState } from 'react';

export default function TimerDisplay({ timeRemaining, totalTime, isRunning, label, color = "var(--accent)" }) {
  const [offset, setOffset] = useState(0);
  const size = 240;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
    const progressOffset = (progress / 100) * circumference;
    setOffset(progressOffset);
  }, [timeRemaining, totalTime, circumference]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer-display">
      <svg width={size} height={size}>
        <circle
          stroke="var(--border)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={center}
          cy={center}
          style={{ 
            transition: 'stroke-dashoffset 1s linear', 
            transform: 'rotate(-90deg)', 
            transformOrigin: '50% 50%',
            filter: isRunning ? 'drop-shadow(0 0 8px var(--accent-soft))' : 'none'
          }}
        />
      </svg>
      <div className="timer-text">
        {formatTime(timeRemaining)}
      </div>
      {label && (
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          maxWidth: '180px',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
