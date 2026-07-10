import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useUser } from '../contexts/UserContext';
import TaskRow from '../components/TaskRow';
import QuickAdd from '../components/QuickAdd';
import ConfettiOverlay from '../components/ConfettiOverlay';
import ProgressRing from '../components/ProgressRing';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';

export default function TodayView() {
  const { getTasksForDate, getSubjectById, syncStatus, subjects, addTask } = useData();
  const { activeUser } = useUser();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tasks = getTasksForDate(todayStr);

  const [sortByPriority, setSortByPriority] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const otherSubject = subjects.find(s => s.name === 'Other');
    if (!otherSubject) return;

    addTask({
      title: chatMessage.trim(),
      subjectId: otherSubject.id,
      subtopicId: null,
      startDate: todayStr,
      endDate: todayStr,
      priority: 'MEDIUM',
      status: 'PENDING'
    });

    setChatMessage('');
  };

  const completedCount = tasks.filter(t => t.status === 'COMPLETED' || (t.completedDates || []).includes(todayStr)).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const allDone = tasks.length > 0 && completedCount === tasks.length;

  let displayTasks = [...tasks];
  if (sortByPriority) {
    const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    displayTasks.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="today-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{greeting()}, {activeUser}! 🌸</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here is your plan for today.</p>
        </div>
        <ProgressRing progress={progress} size={80} />
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Sort By:</span>
        <button 
          onClick={() => setSortByPriority(!sortByPriority)}
          style={{ 
            backgroundColor: sortByPriority ? '#fce7f3' : 'var(--bg-secondary)', 
            color: sortByPriority ? '#db2777' : 'var(--text-secondary)',
            border: `1px solid ${sortByPriority ? '#fbcfe8' : 'var(--border)'}`,
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: sortByPriority ? '0 2px 4px rgba(219, 39, 119, 0.1)' : 'none'
          }}
        >
          Priority
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
        {syncStatus === 'fetching' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', color: '#db2777' }}>
            <Loader2 className="animate-spin" size={48} style={{ marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-secondary)' }}>Loading {activeUser}'s tasks...</h3>
          </div>
        ) : displayTasks.length > 0 ? (
          <table className="task-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Task</th>
                <th>Subject</th>
                <th className="hide-on-mobile">Start Date</th>
                <th className="hide-on-mobile">End Date</th>
                <th>Priority</th>
                <th className="hide-on-mobile">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayTasks.map(task => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  subject={getSubjectById(task.subjectId)}
                  dateStr={todayStr}
                  hideStatus={true}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌷</div>
            <h3>No tasks for today!</h3>
            <p>Add some below to get started.</p>
          </div>
        )}
      </div>

      <form 
        onSubmit={handleChatSubmit}
        style={{
          position: 'sticky',
          bottom: '24px',
          marginTop: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--bg-primary)',
          padding: '8px 12px',
          borderRadius: '30px',
          boxShadow: '0 10px 25px -5px rgba(232, 80, 122, 0.15), 0 8px 10px -6px rgba(232, 80, 122, 0.1)',
          border: '1px solid var(--border-strong)',
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: '20px', paddingLeft: '8px' }}>✨</span>
        <input
          type="text"
          placeholder="Type a quick task for today..."
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            padding: '8px 0',
            fontSize: '15px',
            outline: 'none',
            boxShadow: 'none'
          }}
        />
        <button 
          type="submit"
          disabled={!chatMessage.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: chatMessage.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: chatMessage.trim() ? 'white' : 'var(--text-tertiary)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: chatMessage.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: chatMessage.trim() ? '0 4px 12px rgba(232, 80, 122, 0.3)' : 'none',
          }}
        >
          <Send size={18} style={{ marginLeft: '2px', marginTop: '2px' }} />
        </button>
      </form>

      <ConfettiOverlay show={allDone} />
    </div>
  );
}
