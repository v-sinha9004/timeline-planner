import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { format, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, startOfToday, eachDayOfInterval, getDate } from 'date-fns';
import { useData } from '../contexts/DataContext';
import { useUser } from '../contexts/UserContext';
import ProgressRing from '../components/ProgressRing';

export default function MonthlyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const { getTasksForDate, getSubjectById, updateTask, syncStatus } = useData();
  const { activeUser } = useUser();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const totalDaysThisMonth = getDate(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const completedDaysCount = daysInMonth.filter(d => {
    if (d > startOfToday()) return false;
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayTasks = getTasksForDate(dateStr);
    if (dayTasks.length === 0) return false;
    return dayTasks.every(task => task.status === 'COMPLETED' || (task.completedDates || []).includes(dateStr));
  }).length;
  const monthProgress = totalDaysThisMonth > 0 ? (completedDaysCount / totalDaysThisMonth) * 100 : 0;

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
      
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTasks = getTasksForDate(dateStr);
      
      let cellBg = undefined;
      if (day <= startOfToday() && dayTasks.length > 0) {
        const allCompleted = dayTasks.every(task => task.status === 'COMPLETED' || (task.completedDates || []).includes(dateStr));
        
        if (allCompleted) {
          cellBg = '#bbf7d0'; // green-200 for complete
        } else if (day < startOfToday()) {
          cellBg = '#fda4af'; // rose-300 for darker pinkish red, only for past days
        }
      }
      
      days.push(
        <div 
          className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''}`}
          key={day}
          onClick={() => setSelectedDay(cloneDay)}
          style={{ backgroundColor: cellBg }}
        >
          <div className={`date-number ${isToday ? 'today' : ''}`}>{formattedDate}</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {dayTasks.slice(0, 3).map(task => {
              const subject = getSubjectById(task.subjectId);
              const dateStr = format(day, 'yyyy-MM-dd');
              const isCompleted = task.status === 'COMPLETED' || (task.completedDates || []).includes(dateStr);

              return (
                <div 
                  key={task.id} 
                  className="task-pill"
                  style={{ 
                    backgroundColor: subject ? subject.color : 'var(--text-tertiary)',
                    opacity: isCompleted ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 6px'
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
                      width: '14px', 
                      height: '14px', 
                      flexShrink: 0, 
                      borderRadius: '3px', 
                      borderWidth: '1.5px',
                      borderColor: isCompleted ? 'var(--accent)' : 'var(--border-strong)',
                      backgroundColor: isCompleted ? 'var(--accent)' : 'var(--bg-primary)'
                    }}
                  >
                    {isCompleted && <Check size={10} color="white" />}
                  </div>
                  <span style={{ 
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {task.title}
                  </span>
                </div>
              );
            })}
            {dayTasks.length > 3 && (
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', paddingLeft: '2px' }}>
                +{dayTasks.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div style={{ display: 'contents' }} key={day}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="monthly-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '24px' }}>
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <ProgressRing 
            progress={monthProgress} 
            size={48} 
            strokeWidth={4} 
            label={`${completedDaysCount}/${totalDaysThisMonth}`}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={prevMonth}><ChevronLeft size={20} /></button>
          <button className="btn" style={{ border: '1px solid var(--border)' }} onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className="btn-icon" onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
      </div>

      {syncStatus === 'fetching' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', color: '#db2777', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Loader2 className="animate-spin" size={48} style={{ marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>Loading {activeUser}'s tasks...</h3>
        </div>
      ) : (
        <div className="monthly-grid-wrapper">
          <div className="monthly-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="month-day-header">{d}</div>
            ))}
            {rows}
          </div>
        </div>
      )}

      {selectedDay && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>
                {format(selectedDay, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button className="btn-icon" onClick={() => setSelectedDay(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                const dayTasks = getTasksForDate(format(selectedDay, 'yyyy-MM-dd'));
                if (dayTasks.length === 0) {
                  return <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px' }}>No tasks for this day.</div>;
                }
                return dayTasks.map(task => {
                  const subject = getSubjectById(task.subjectId);
                  const dateStr = format(selectedDay, 'yyyy-MM-dd');
                  const isCompleted = task.status === 'COMPLETED' || (task.completedDates || []).includes(dateStr);

                  return (
                    <div 
                      key={task.id} 
                      className="task-pill"
                      style={{ 
                        backgroundColor: subject ? subject.color : 'var(--text-tertiary)',
                        opacity: isCompleted ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        borderRadius: '6px'
                      }}
                    >
                      <div 
                        className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          let newCompletedDates = [...(task.completedDates || [])];
                          if (isCompleted) {
                             newCompletedDates = newCompletedDates.filter(d => d !== dateStr);
                             const updates = { completedDates: newCompletedDates };
                             if (task.status === 'COMPLETED') updates.status = 'IN_PROGRESS';
                             updateTask(task.id, updates);
                          } else {
                             newCompletedDates.push(dateStr);
                             updateTask(task.id, { completedDates: newCompletedDates });
                          }
                        }}
                        style={{ 
                          width: '18px', 
                          height: '18px', 
                          marginTop: '1px',
                          flexShrink: 0, 
                          borderRadius: '4px', 
                          borderWidth: '1.5px',
                          borderColor: isCompleted ? 'var(--accent)' : 'var(--border-strong)',
                          backgroundColor: isCompleted ? 'var(--accent)' : 'var(--bg-primary)'
                        }}
                      >
                        {isCompleted && <Check size={14} color="white" />}
                      </div>
                      <span style={{ 
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        overflow: 'visible'
                      }}>
                        {task.title}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
