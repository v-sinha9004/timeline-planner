import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

export default function QuickAdd() {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const { subjects, addTask } = useData();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    addTask({
      title: title.trim(),
      subjectId,
      date: format(new Date(), 'yyyy-MM-dd'),
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
        onChange={(e) => setSubjectId(e.target.value)}
        required
        style={{ maxWidth: '150px' }}
      >
        <option value="" disabled>Select Subject</option>
        {subjects.map(s => (
          <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
        ))}
      </select>
      <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px' }}>Add</button>
    </form>
  );
}
