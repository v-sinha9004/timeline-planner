import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import SubjectBadge from '../components/SubjectBadge';
import TimerDisplay from '../components/TimerDisplay';
import { Play, Pause, Square, RotateCcw, Timer, Coffee } from 'lucide-react';
import { format } from 'date-fns';
import TimerDevTools from '../components/TimerDevTools';
import FocusSummary from '../components/FocusSummary';

export default function FocusTimer() {
  const { getTasksForDate, getSubjectById, addTimeLog, timeLogs } = useData();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tasks = getTasksForDate(todayStr).filter(t => t.status !== 'COMPLETED');

  const [activeTab, setActiveTab] = useState('timer'); // 'timer' | 'summary'
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isBreakMode, setIsBreakMode] = useState(false);

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
    if (!isBreakMode && !selectedTaskId) {
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
          // Pass 0 to avoid stale closure state
          handleSessionComplete(0);
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
      handleSessionComplete(timeRemaining);
    }
  };

  const forceCompleteTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setIsRunning(false);
    handleSessionComplete(0);
    setTimeRemaining(0);
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeRemaining(totalTime);
    setSessionStartTime(null);
  };

  const handleSessionComplete = (finalTimeRemaining = timeRemaining) => {
    const duration = totalTime - finalTimeRemaining;
    if (duration > 0 && (selectedTaskId || isBreakMode)) {
      addTimeLog({
        taskId: isBreakMode ? 'break' : selectedTaskId,
        startedAt: sessionStartTime ? sessionStartTime.toISOString() : new Date().toISOString(),
        endedAt: new Date().toISOString(),
        duration,
        date: todayStr,
        isBreak: isBreakMode
      });
    }
    setSessionStartTime(null);
  };

  const todaysLogs = (timeLogs || []).filter(log => log.date === todayStr);
  let totalWorkTime = 0;
  let totalBreakTime = 0;
  
  todaysLogs.forEach(log => {
    if (log.isBreak || log.taskId === 'break') {
      totalBreakTime += log.duration;
    } else {
      totalWorkTime += log.duration;
    }
  });

  const formatSummaryTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="focus-timer-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '32px', 
        borderBottom: '1px solid var(--border)', 
        paddingBottom: '16px' 
      }}>
        <button 
          className="btn"
          style={{ 
            backgroundColor: activeTab === 'timer' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'timer' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'timer' ? 600 : 500,
            padding: '8px 24px'
          }}
          onClick={() => setActiveTab('timer')}
        >
          Focus Timer
        </button>
        <button 
          className="btn"
          style={{ 
            backgroundColor: activeTab === 'summary' ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === 'summary' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'summary' ? 600 : 500,
            padding: '8px 24px'
          }}
          onClick={() => setActiveTab('summary')}
        >
          Summary Insights
        </button>
      </div>

      {activeTab === 'timer' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.3s ease' }}>
          <div className="timer-container" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px' }}>
              <h2>{isBreakMode ? 'Break Time' : 'Focus Session'}</h2>
              <button 
                className="btn btn-icon" 
                title={isBreakMode ? "Switch to Focus" : "Take a Break"}
                onClick={() => {
                  setIsBreakMode(!isBreakMode);
                  setPreset(!isBreakMode ? 5 : 25);
                }}
                style={{ color: isBreakMode ? 'var(--subject-geography)' : 'inherit' }}
              >
                <Coffee size={20} />
              </button>
            </div>
            
            {!isBreakMode ? (
              <>
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
              </>
            ) : (
              <>
                <div style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                  Time to recharge your mind!
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button className="btn" style={{ backgroundColor: 'var(--bg-tertiary)' }} onClick={() => setPreset(5)}>5m</button>
                  <button className="btn" style={{ backgroundColor: 'var(--bg-tertiary)' }} onClick={() => setPreset(10)}>10m</button>
                  <button className="btn" style={{ backgroundColor: 'var(--bg-tertiary)' }} onClick={() => setPreset(15)}>15m</button>
                </div>
              </>
            )}

            <TimerDisplay 
              timeRemaining={timeRemaining} 
              totalTime={totalTime} 
              isRunning={isRunning} 
              label={isBreakMode ? "Break" : (selectedTask?.title || "Ready to focus")}
              color={isBreakMode ? "var(--subject-geography)" : "var(--accent)"}
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
          
          {/* Moved TimerDevTools to a dedicated section underneath the timer */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px' }}>Testing Tools</h3>
            <TimerDevTools 
              forceCompleteTimer={forceCompleteTimer}
              isBreakMode={isBreakMode}
              selectedTaskId={selectedTaskId}
            />
          </div>
        </div>
      ) : (
        <FocusSummary />
      )}
    </div>
  );
}
