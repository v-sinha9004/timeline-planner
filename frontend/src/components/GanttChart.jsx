import { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import './GanttChart.css';

export default function GanttChart({ tasks }) {
  const ganttRef = useRef(null);
  const ganttInstance = useRef(null);

  useEffect(() => {
    if (ganttRef.current && tasks.length > 0) {
      // Clear previous instance
      ganttRef.current.innerHTML = '';
      
      try {
        ganttInstance.current = new Gantt(ganttRef.current, tasks, {
          header_height: 50,
          column_width: 30,
          bar_height: 28,
          bar_corner_radius: 4,
          padding: 14,
          view_mode: 'Day',
          date_format: 'YYYY-MM-DD',
          custom_popup_html: function(task) {
            const startStr = task._start instanceof Date
              ? task._start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : String(task.start);
            const endStr = task._end instanceof Date
              ? task._end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : String(task.end);
            return `
              <div class="gantt-popup">
                <div class="gantt-popup-title">${task.name}</div>
                <div class="gantt-popup-dates">${startStr} → ${endStr}</div>
              </div>
            `;
          }
        });
        

      } catch (err) {
        console.error("Error initializing Gantt:", err);
      }
    }
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
        <p style={{ fontSize: '16px' }}>No tasks with dates to visualize.</p>
      </div>
    );
  }

  return <div ref={ganttRef} className="gantt-wrapper"></div>;
}
