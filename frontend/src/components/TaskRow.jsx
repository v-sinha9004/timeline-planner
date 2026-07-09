import { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import SubjectBadge from './SubjectBadge';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

export default function TaskRow({ task, subject, dateStr, hideStatus = false }) {
  const { updateTask, deleteTask } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editStartDate, setEditStartDate] = useState(task.startDate || '');
  const [editEndDate, setEditEndDate] = useState(task.endDate || '');
  const inputRef = useRef(null);

  const isCompleted = dateStr 
    ? (task.status === 'COMPLETED' || (task.completedDates || []).includes(dateStr))
    : task.status === 'COMPLETED';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const toggleComplete = () => {
    if (dateStr) {
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
    } else {
      updateTask(task.id, { status: isCompleted ? 'PENDING' : 'COMPLETED' });
    }
  };

  const handleSave = () => {
    const updates = {};
    if (editTitle.trim() && editTitle !== task.title) {
      updates.title = editTitle.trim();
    }
    if (editPriority !== task.priority) {
      updates.priority = editPriority;
    }
    if (editStartDate !== (task.startDate || '')) {
      updates.startDate = editStartDate;
    }
    if (editEndDate !== (task.endDate || '')) {
      updates.endDate = editEndDate;
    }
    
    if (Object.keys(updates).length > 0) {
      updateTask(task.id, updates);
    } else {
      setEditTitle(task.title);
      setEditPriority(task.priority);
      setEditStartDate(task.startDate || '');
      setEditEndDate(task.endDate || '');
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditStartDate(task.startDate || '');
    setEditEndDate(task.endDate || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return 'var(--border-strong)';
    }
  };

  return (
    <tr className={`task-row ${isCompleted ? 'completed' : ''}`}>
      <td style={{ width: '40px' }}>
        <div 
          className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}
          onClick={toggleComplete}
        >
          {isCompleted && <Check size={14} />}
        </div>
      </td>
      <td>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ padding: '4px 8px', width: '100%' }}
            />
          </div>
        ) : (
          <span 
            className="task-title" 
            style={{ fontWeight: 500, cursor: 'pointer', display: 'block' }}
            onClick={() => setIsEditing(true)}
          >
            {task.title}
          </span>
        )}
      </td>
      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
          <SubjectBadge subject={subject} />
          {task.subtopicId && subject && subject.subtopics && (
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '4px' }}>
              ↳ {subject.subtopics.find(st => st.id === task.subtopicId)?.name || 'Unknown Sub-topic'}
            </span>
          )}
        </div>
      </td>
      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
        {isEditing ? (
          <input 
            type="date" 
            value={editStartDate}
            onChange={(e) => setEditStartDate(e.target.value)}
            style={{ fontSize: '12px', padding: '2px 4px', width: '110px', height: '24px' }}
          />
        ) : (
          task.startDate ? format(new Date(task.startDate), 'MMM d, yyyy') : '--'
        )}
      </td>
      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
        {isEditing ? (
          <input 
            type="date" 
            value={editEndDate}
            onChange={(e) => setEditEndDate(e.target.value)}
            style={{ fontSize: '12px', padding: '2px 4px', width: '110px', height: '24px' }}
          />
        ) : (
          task.endDate ? format(new Date(task.endDate), 'MMM d, yyyy') : '--'
        )}
      </td>
      <td>
        {isEditing ? (
          <select 
            value={editPriority} 
            onChange={(e) => setEditPriority(e.target.value)}
            style={{ fontSize: '12px', padding: '4px 8px', height: 'auto', width: '100%' }}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getPriorityColor() }} />
            {task.priority}
          </div>
        )}
      </td>
      {!hideStatus && (
        <td>
          <select 
            value={task.status} 
            onChange={(e) => updateTask(task.id, { status: e.target.value })}
            style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </td>
      )}
      <td style={{ width: '120px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {isEditing ? (
            <>
              <button className="btn-icon" title="Save" onClick={handleSave}>
                <Check size={16} />
              </button>
              <button className="btn-icon" title="Cancel" onClick={handleCancel}>
                <X size={16} />
              </button>
            </>
          ) : (
            <button className="btn-icon" title="Edit" onClick={() => setIsEditing(true)}>
              <Edit2 size={16} />
            </button>
          )}
          <button className="btn-icon" title="Delete" onClick={() => deleteTask(task.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
