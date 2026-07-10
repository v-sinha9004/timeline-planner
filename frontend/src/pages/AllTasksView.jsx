import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useUser } from '../contexts/UserContext';
import TaskRow from '../components/TaskRow';
import { Search, Loader2 } from 'lucide-react';

export default function AllTasksView() {
  const { tasks, subjects, getSubjectById, syncStatus } = useData();
  const { activeUser } = useUser();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'asc' });

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSubject = subjectFilter === 'ALL' || t.subjectId === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortConfig.key === 'none') return 0;
    
    // Put items without dates at the end of the list depending on sort order
    const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : (sortConfig.direction === 'asc' ? Infinity : -Infinity);
    const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : (sortConfig.direction === 'asc' ? Infinity : -Infinity);
    
    if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="all-tasks">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>
        
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          <option value="ALL">All Subjects</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <div style={{ position: 'relative' }}>
          <select 
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split('-');
              setSortConfig({ key, direction });
            }}
            style={{
              backgroundColor: '#fdf2f8',
              color: '#db2777',
              border: '1px solid #fbcfe8',
              borderRadius: '8px',
              padding: '8px 32px 8px 16px',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 2px 4px rgba(219, 39, 119, 0.1)',
              appearance: 'none',
              height: '100%',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#fce7f3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#fdf2f8'}
          >
            <option value="none-asc">Sort by...</option>
            <option value="startDate-asc">Start Date (Ascending)</option>
            <option value="startDate-desc">Start Date (Descending)</option>
            <option value="endDate-asc">End Date (Ascending)</option>
            <option value="endDate-desc">End Date (Descending)</option>
          </select>
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#db2777', fontSize: '10px' }}>
            ▼
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '12px 24px', border: '1px solid var(--border)' }}>
        {syncStatus === 'fetching' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', color: '#db2777' }}>
            <Loader2 className="animate-spin" size={48} style={{ marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-secondary)' }}>Loading {activeUser}'s tasks...</h3>
          </div>
        ) : (
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
              {sortedTasks.length > 0 ? (
                sortedTasks.map(task => (
                  <TaskRow 
                    key={task.id} 
                    task={task} 
                    subject={getSubjectById(task.subjectId)} 
                    readOnlyCheckbox={true}
                    hideStatus={true}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    No tasks found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
