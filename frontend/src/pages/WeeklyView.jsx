import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { useData } from '../contexts/DataContext';
import { useUser } from '../contexts/UserContext';

export default function WeeklyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getTasksForDate, getSubjectById, updateTask, syncStatus } = useData();
  const { activeUser } = useUser();
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="weekly-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={prevWeek}><ChevronLeft size={20} /></button>
          <button className="btn" style={{ border: '1px solid var(--border)' }} onClick={goToday}>Today</button>
          <button className="btn-icon" onClick={nextWeek}><ChevronRight size={20} /></button>
        </div>
        <h3 style={{ margin: 0 }}>
          {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
        </h3>
      </div>

      {syncStatus === 'fetching' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', color: '#db2777', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Loader2 className="animate-spin" size={48} style={{ marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>Loading {activeUser}'s tasks...</h3>
        </div>
      ) : (
        <div className="weekly-grid-new">
        {days.map((day, i) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <div key={i} className="weekly-header" style={{ backgroundColor: isToday ? 'var(--accent-softer)' : '', borderRight: i < 6 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: '12px', color: isToday ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {format(day, 'EEE')}
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: isToday ? 700 : 500,
                color: isToday ? 'var(--accent)' : 'var(--text-primary)'
              }}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}

        {/* Days columns */}
        {days.map((day, i) => {
          const dayTasks = getTasksForDate(format(day, 'yyyy-MM-dd'));
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

          return (
            <div 
              key={i} 
              className="day-col-new" 
              style={{ 
                borderRight: i < 6 ? '1px solid var(--border)' : 'none',
                backgroundColor: isToday ? 'var(--bg-secondary)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px' }}>
                {dayTasks.map(task => {
                  const subject = getSubjectById(task.subjectId);
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isCompleted = task.status === 'COMPLETED' || (task.completedDates || []).includes(dateStr);

                  return (
                    <div 
                      key={task.id} 
                      style={{ 
                        backgroundColor: subject ? subject.color : 'var(--text-tertiary)',
                        color: 'white',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        boxShadow: 'var(--shadow-sm)',
                        wordBreak: 'break-word',
                        opacity: isCompleted ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      <div 
                        className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const getAllTaskDates = (t) => {
                            if (t.startDate && t.endDate) {
                              try {
                                const start = new Date(t.startDate);
                                const end = new Date(t.endDate);
                                if (!isNaN(start) && !isNaN(end) && start <= end) {
                                  const dates = [];
                                  let d = start;
                                  while(d <= end) {
                                    dates.push(format(d, 'yyyy-MM-dd'));
                                    d = addDays(d, 1);
                                  }
                                  return dates;
                                }
                              } catch (e) {}
                            } else if (t.startDate) return [t.startDate.substring(0, 10)];
                            else if (t.endDate) return [t.endDate.substring(0, 10)];
                            else if (t.date) return [t.date.substring(0, 10)];
                            return [];
                          };

                          let newCompletedDates = [...(task.completedDates || [])];
                          if (isCompleted) {
                             newCompletedDates = newCompletedDates.filter(d => d !== dateStr);
                             const updates = { completedDates: newCompletedDates };
                             if (task.status === 'COMPLETED') {
                               updates.status = 'IN_PROGRESS';
                               const allDates = getAllTaskDates(task);
                               if (allDates.length > 0) {
                                 updates.completedDates = allDates.filter(d => d !== dateStr);
                               }
                             }
                             updateTask(task.id, updates);
                          } else {
                             newCompletedDates.push(dateStr);
                             const allDates = getAllTaskDates(task);
                             const isAllCompleted = allDates.length > 0 && allDates.every(d => newCompletedDates.includes(d));
                             const updates = { completedDates: newCompletedDates };
                             if (isAllCompleted) {
                               updates.status = 'COMPLETED';
                             }
                             updateTask(task.id, updates);
                          }
                        }}
                        style={{ 
                          marginTop: '2px', 
                          width: '16px', 
                          height: '16px', 
                          flexShrink: 0, 
                          borderRadius: '4px',
                          borderWidth: '1.5px',
                          borderColor: isCompleted ? 'var(--accent)' : 'var(--border-strong)',
                          backgroundColor: isCompleted ? 'var(--accent)' : 'var(--bg-primary)'
                        }}
                      >
                        {isCompleted && <Check size={12} color="white" />}
                      </div>
                      <span style={{ 
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        wordBreak: 'break-word'
                      }}>
                        {task.title}
                      </span>
                    </div>
                  );
                })}
                {dayTasks.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px', padding: '20px 0' }}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
