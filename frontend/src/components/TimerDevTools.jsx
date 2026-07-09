import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

export default function TimerDevTools({ forceCompleteTimer, isBreakMode, selectedTaskId }) {
  const { addTimeLog } = useData();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const simulateTimeLog = (minutes) => {
    if (!isBreakMode && !selectedTaskId) {
      alert("Please select a task first to simulate a focus session!");
      return;
    }
    const duration = minutes * 60;
    
    // Use an offset so startedAt is in the past
    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - duration * 1000);

    const taskId = isBreakMode ? 'break' : selectedTaskId;

    addTimeLog({
      taskId,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      duration,
      date: todayStr,
      isBreak: isBreakMode
    });
  };

  return (
    <div style={{ marginTop: '40px', padding: '16px', border: '1px dashed var(--accent)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
      <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--accent)' }}>Dev Tools (Testing Only)</h3>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <button 
          className="btn" 
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent)', fontSize: '12px' }} 
          onClick={forceCompleteTimer}
        >
          Fast-forward Timer to End
        </button>
      </div>

      <div style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
        Simulate {isBreakMode ? 'Break' : 'Focus'} Session:
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          className="btn" 
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', fontSize: '12px' }} 
          onClick={() => simulateTimeLog(2)}
        >
          +2 Min
        </button>
        <button 
          className="btn" 
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', fontSize: '12px' }} 
          onClick={() => simulateTimeLog(5)}
        >
          +5 Min
        </button>
        <button 
          className="btn" 
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', fontSize: '12px' }} 
          onClick={() => simulateTimeLog(10)}
        >
          +10 Min
        </button>
      </div>
    </div>
  );
}
