import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from 'date-fns';
import { useData } from '../contexts/DataContext';

export default function MonthlyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getTasksForDate, getSubjectById } = useData();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

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
      
      const dayTasks = getTasksForDate(format(day, 'yyyy-MM-dd'));
      
      days.push(
        <div 
          className={`calendar-cell ${!isCurrentMonth ? 'other-month' : ''}`}
          key={day}
        >
          <div className={`date-number ${isToday ? 'today' : ''}`}>{formattedDate}</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {dayTasks.slice(0, 3).map(task => {
              const subject = getSubjectById(task.subjectId);
              return (
                <div 
                  key={task.id} 
                  className="task-pill"
                  style={{ backgroundColor: subject ? subject.color : 'var(--text-tertiary)' }}
                >
                  {task.title}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '24px' }}>
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={prevMonth}><ChevronLeft size={20} /></button>
          <button className="btn" style={{ border: '1px solid var(--border)' }} onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className="btn-icon" onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="monthly-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="month-day-header">{d}</div>
        ))}
        {rows}
      </div>
    </div>
  );
}
