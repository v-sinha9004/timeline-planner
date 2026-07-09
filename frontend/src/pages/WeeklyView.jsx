import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

export default function WeeklyView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const hours = Array.from({ length: 18 }).map((_, i) => i + 6); // 6am to 11pm

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

      <div className="weekly-grid">
        <div className="weekly-header" style={{ borderRight: '1px solid var(--border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>GMT+5:30</span>
        </div>
        {days.map((day, i) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <div key={i} className="weekly-header" style={{ backgroundColor: isToday ? 'var(--accent-softer)' : '' }}>
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

        {/* Time labels column */}
        <div className="time-col">
          {hours.map(hour => (
            <div key={hour} className="time-label">
              {hour}:00
            </div>
          ))}
        </div>

        {/* Days columns */}
        {days.map((day, i) => (
          <div key={i} className="day-col">
            {hours.map(hour => (
              <div key={hour} className="grid-line" />
            ))}
            
            {/* We will render TimeBlocks here in a future iteration based on getTasksForDate */}
            <div style={{ padding: '8px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px', opacity: 0.5 }}>
              (Time blocks feature coming soon)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
