import { useState, useEffect, useRef } from 'react';
import { ClockIcon } from './Icons';

const Timer = ({ durationSeconds, onExpire }) => {
  const [seconds, setSeconds] = useState(durationSeconds);
  const intervalRef = useRef(null);
  const hasExpired = useRef(false);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (!hasExpired.current) {
            hasExpired.current = true;
            setTimeout(onExpire, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [onExpire]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const display = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const isUrgent = seconds <= 60;

  return (
    <div className={`timer-display ${isUrgent ? 'urgent' : ''} inline-icon gap-icon`}>
      <ClockIcon size={16} />
      <span>{display}</span>
    </div>
  );
};

export default Timer;
