import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../contexts/DataContext';
import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskModal({ isOpen, onClose, taskToEdit = null }) {
  const { subjects, addTask, updateTask } = useData();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subtopicId, setSubtopicId] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [priority, setPriority] = useState('MEDIUM');

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title || '');
        setSubjectId(taskToEdit.subjectId || '');
        setSubtopicId(taskToEdit.subtopicId || '');
        setStartDate(taskToEdit.startDate || format(new Date(), 'yyyy-MM-dd'));
        setEndDate(taskToEdit.endDate || format(new Date(), 'yyyy-MM-dd'));
        setPriority(taskToEdit.priority || 'MEDIUM');
      } else {
        setTitle('');
        setSubjectId('');
        setSubtopicId('');
        setStartDate(format(new Date(), 'yyyy-MM-dd'));
        setEndDate(format(new Date(), 'yyyy-MM-dd'));
        setPriority('MEDIUM');
      }
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) {
      alert('Title and Subject are required');
      return;
    }

    const taskData = {
      title: title.trim(),
      subjectId,
      subtopicId,
      startDate,
      endDate,
      priority,
      status: taskToEdit ? taskToEdit.status : 'PENDING'
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }
    
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{taskToEdit ? 'Edit Task' : 'New Task'}</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body flex-col gap-lg">
            
            <div className="flex-col gap-sm">
              <label style={{ fontWeight: 500 }}>Task Title *</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                required
              />
            </div>

            <div className="flex gap-md">
              <div className="flex-col gap-sm" style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Subject *</label>
                <select 
                  value={subjectId}
                  onChange={e => {
                    setSubjectId(e.target.value);
                    setSubtopicId('');
                  }}
                  required
                >
                  <option value="" disabled>Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>

              {subjectId && (
                <div className="flex-col gap-sm" style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500 }}>Sub-topic</label>
                  {(() => {
                    const selectedSubject = subjects.find(s => s.id === subjectId);
                    const subtopics = selectedSubject?.subtopics || [];
                    if (subtopics.length === 0) {
                      return (
                        <div style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                          No sub-topics
                        </div>
                      );
                    }
                    return (
                      <select 
                        value={subtopicId}
                        onChange={e => setSubtopicId(e.target.value)}
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
            </div>

            <div className="flex gap-md">
              <div className="flex-col gap-sm" style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={e => {
                    const newStartDate = e.target.value;
                    setStartDate(newStartDate);
                    if (endDate && newStartDate > endDate) {
                      setEndDate(newStartDate);
                    }
                  }}
                />
              </div>

              <div className="flex-col gap-sm" style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-col gap-sm">
              <label style={{ fontWeight: 500 }}>Priority</label>
              <div className="flex gap-sm">
                <button 
                  type="button"
                  className="btn" 
                  style={{ flex: 1, border: '1px solid var(--border)', backgroundColor: priority === 'HIGH' ? '#fef2f2' : 'transparent', color: priority === 'HIGH' ? '#ef4444' : 'inherit', borderColor: priority === 'HIGH' ? '#ef4444' : 'var(--border)' }}
                  onClick={() => setPriority('HIGH')}
                >
                  High
                </button>
                <button 
                  type="button"
                  className="btn" 
                  style={{ flex: 1, border: '1px solid var(--border)', backgroundColor: priority === 'MEDIUM' ? '#fffbeb' : 'transparent', color: priority === 'MEDIUM' ? '#f59e0b' : 'inherit', borderColor: priority === 'MEDIUM' ? '#f59e0b' : 'var(--border)' }}
                  onClick={() => setPriority('MEDIUM')}
                >
                  Medium
                </button>
                <button 
                  type="button"
                  className="btn" 
                  style={{ flex: 1, border: '1px solid var(--border)', backgroundColor: priority === 'LOW' ? '#ecfdf5' : 'transparent', color: priority === 'LOW' ? '#10b981' : 'inherit', borderColor: priority === 'LOW' ? '#10b981' : 'var(--border)' }}
                  onClick={() => setPriority('LOW')}
                >
                  Low
                </button>
              </div>
            </div>

          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn" style={{ border: '1px solid var(--border)' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Task</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
