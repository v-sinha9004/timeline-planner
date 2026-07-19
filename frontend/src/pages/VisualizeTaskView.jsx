import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useUser } from '../contexts/UserContext';
import GanttChart from '../components/GanttChart';
import { Loader2 } from 'lucide-react';

export default function VisualizeTaskView() {
  const { tasks, subjects, syncStatus } = useData();
  const { activeUser } = useUser();
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // Prepare tasks for Gantt chart
  const ganttTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const start = t.startDate || t.date;
        if (!start) return false;

        const matchesSubject = subjectFilter === 'ALL' || t.subjectId === subjectFilter;
        return matchesSubject;
      })
      .map(t => {
        const start = t.startDate || t.date;
        let end = t.endDate || start;
        // Single-day tasks need at least 1 day width
        if (start === end) {
          const d = new Date(start);
          d.setDate(d.getDate() + 1);
          end = d.toISOString().split('T')[0];
        }

        let customClass = '';
        if (t.status === 'COMPLETED') customClass = 'status-completed';
        else if (t.status === 'IN_PROGRESS') customClass = 'status-in-progress';
        else customClass = 'status-pending';

        return {
          id: String(t.id || Math.random()),
          name: t.title || 'Untitled Task',
          start: start,
          end: end,
          progress: t.status === 'COMPLETED' ? 100 : (t.status === 'IN_PROGRESS' ? 50 : 0),
          custom_class: customClass,
        };
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [tasks, subjectFilter]);

  return (
    <div className="visualize-tasks">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        {/* <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Visualize Tasks</h2> */}

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
        >
          <option value="ALL">All Subjects</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {syncStatus === 'fetching' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', color: 'var(--accent)' }}>
          <Loader2 className="animate-spin" size={48} style={{ marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>Loading {activeUser}'s timeline...</h3>
        </div>
      ) : (
        <GanttChart tasks={ganttTasks} />
      )}
    </div>
  );
}
