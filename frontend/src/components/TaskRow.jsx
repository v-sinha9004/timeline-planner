import { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Timer, Check, X } from 'lucide-react';
import SubjectBadge from './SubjectBadge';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function TaskRow({ task, subject }) {
  const { updateTask, deleteTask } = useData();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority);
  const inputRef = useRef(null);

  const isCompleted = task.status === 'COMPLETED';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const toggleComplete = () => {
    updateTask(task.id, { status: isCompleted ? 'PENDING' : 'COMPLETED' });
  };

  const handleSave = () => {
    const updates = {};
    if (editTitle.trim() && editTitle !== task.title) {
      updates.title = editTitle.trim();
    }
    if (editPriority !== task.priority) {
      updates.priority = editPriority;
    }
    
    if (Object.keys(updates).length > 0) {
      updateTask(task.id, updates);
    } else {
      setEditTitle(task.title);
      setEditPriority(task.priority);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority);
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

  const startFocus = () => {
    navigate('/focus', { state: { taskId: task.id } });
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
        <SubjectBadge subject={subject} />
      </td>
      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
        {task.startDate ? `${format(new Date(task.startDate), 'MMM d, yyyy')} - ${task.endDate ? format(new Date(task.endDate), 'MMM d, yyyy') : '?'}` : '--'}
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
          {!isCompleted && (
            <button className="btn-icon" title="Start Timer" onClick={startFocus}>
              <Timer size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
