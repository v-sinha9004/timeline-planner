import { useData } from '../contexts/DataContext';
import TaskRow from '../components/TaskRow';
import QuickAdd from '../components/QuickAdd';
import ConfettiOverlay from '../components/ConfettiOverlay';
import ProgressRing from '../components/ProgressRing';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function TodayView() {
  const { getTasksForDate, getSubjectById } = useData();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tasks = getTasksForDate(todayStr);

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const allDone = tasks.length > 0 && completedCount === tasks.length;

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
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{greeting()}, Vishal! 🌸</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here is your plan for today.</p>
        </div>
        <ProgressRing progress={progress} size={80} />
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
        {tasks.length > 0 ? (
          <table className="task-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Task</th>
                <th>Subject</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  subject={getSubjectById(task.subjectId)} 
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


      <QuickAdd />
      <ConfettiOverlay show={allDone} />
    </div>
  );
}
