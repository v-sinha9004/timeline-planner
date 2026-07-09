import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import TaskRow from '../components/TaskRow';
import { Search } from 'lucide-react';

export default function AllTasksView() {
  const { tasks, subjects, getSubjectById } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSubject = subjectFilter === 'ALL' || t.subjectId === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
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
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '12px 24px', border: '1px solid var(--border)' }}>
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
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  subject={getSubjectById(task.subjectId)} 
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  No tasks found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
