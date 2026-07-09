import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import SubjectBadge from '../components/SubjectBadge';
import TimerDisplay from '../components/TimerDisplay';
import { Play, Pause, Square, RotateCcw, Timer } from 'lucide-react';
import { format } from 'date-fns';

export default function FocusTimer() {
  const { getTasksForDate, getSubjectById, addTimeLog } = useData();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tasks = getTasksForDate(todayStr).filter(t => t.status !== 'COMPLETED');

  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const selectedSubject = selectedTask ? getSubjectById(selectedTask.subjectId) : null;

  const setPreset = (minutes) => {
    const seconds = minutes * 60;
    setTotalTime(seconds);
    setTimeRemaining(seconds);
    setIsRunning(false);
    if (intervalId) clearInterval(intervalId);
  };

  const startTimer = () => {
    if (!selectedTaskId) {
      alert("Please select a task first!");
      return;
    }
    if (timeRemaining <= 0) return;
    
    if (!sessionStartTime) setSessionStartTime(new Date());
    
    setIsRunning(true);
    const id = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setIsRunning(false);
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalId) clearInterval(intervalId);
  };

  const stopTimer = () => {
    pauseTimer();
    if (sessionStartTime) {
      handleSessionComplete();
    }
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeRemaining(totalTime);
    setSessionStartTime(null);
  };

  const handleSessionComplete = () => {
    const duration = totalTime - timeRemaining;
    if (duration > 0 && selectedTaskId) {
      addTimeLog({
        taskId: selectedTaskId,
        startedAt: sessionStartTime.toISOString(),
        endedAt: new Date().toISOString(),
        duration,
        date: todayStr
      });
    }
    setSessionStartTime(null);
  };

  return (
    <div className="flex gap-lg">
      <div className="timer-container" style={{ flex: 2 }}>
        <h2 style={{ marginBottom: '24px' }}>Focus Session</h2>
        
        <select 
          value={selectedTaskId} 
          onChange={(e) => setSelectedTaskId(e.target.value)}
          style={{ width: '100%', maxWidth: '300px', marginBottom: '16px' }}
        >
          <option value="">-- Select a Task --</option>
          {tasks.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>

        {selectedSubject && (
          <div style={{ marginBottom: '16px' }}>
            <SubjectBadge subject={selectedSubject} />
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button className="btn" style={{ backgroundColor: 'var(--bg-tertiary)' }} onClick={() => setPreset(25)}>25m</button>
          <button className="btn" style={{ backgroundColor: 'var(--bg-tertiary)' }} onClick={() => setPreset(45)}>45m</button>
          <button className="btn" style={{ backgroundColor: 'var(--bg-tertiary)' }} onClick={() => setPreset(60)}>60m</button>
        </div>

        <TimerDisplay 
          timeRemaining={timeRemaining} 
          totalTime={totalTime} 
          isRunning={isRunning} 
          label={selectedTask?.title || "Ready to focus"}
        />

        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          {!isRunning ? (
            <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '16px' }} onClick={startTimer}>
              <Play size={20} /> Start
            </button>
          ) : (
            <button className="btn" style={{ padding: '12px 32px', fontSize: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }} onClick={pauseTimer}>
              <Pause size={20} /> Pause
            </button>
          )}
          <button className="btn" style={{ padding: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }} onClick={stopTimer} title="Stop & Save">
            <Square size={20} />
          </button>
          <button className="btn" style={{ padding: '12px', border: '1px solid var(--border)', backgroundColor: 'transparent' }} onClick={resetTimer} title="Reset">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
        <h3>Daily Summary</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>Time logged today</p>
        
        {/* Placeholder for time summary until we implement the selector properly */}
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
          <Timer size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          Complete a session to see your stats!
        </div>
      </div>
    </div>
  );
}
