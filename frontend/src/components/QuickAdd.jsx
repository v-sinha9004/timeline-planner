import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

export default function QuickAdd() {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subtopicId, setSubtopicId] = useState('');
  const { subjects, addTask } = useData();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    addTask({
      title: title.trim(),
      subjectId,
      subtopicId,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      priority: 'MEDIUM',
      status: 'PENDING'
    });

    setTitle('');
  };

  return (
    <form className="quick-add-container" onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Add a new task for today... (Press Enter)" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <select 
        value={subjectId} 
        onChange={(e) => {
          setSubjectId(e.target.value);
          setSubtopicId('');
        }}
        required
        style={{ maxWidth: '150px' }}
      >
        <option value="" disabled>Select Subject</option>
        {subjects.map(s => (
          <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
        ))}
      </select>
      
      {subjectId && (
        <div style={{ maxWidth: '150px', display: 'flex', alignItems: 'center' }}>
          {(() => {
            const selectedSubject = subjects.find(s => s.id === subjectId);
            const subtopics = selectedSubject?.subtopics || [];
            if (subtopics.length === 0) {
              return <span style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '0 8px' }}>No sub-topics</span>;
            }
            return (
              <select 
                value={subtopicId} 
                onChange={(e) => setSubtopicId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">None</option>
                {subtopics.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            );
          })()}
        </div>
      )}
      <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px' }}>Add</button>
    </form>
  );
}
