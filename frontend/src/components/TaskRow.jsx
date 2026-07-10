import { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import SubjectBadge from './SubjectBadge';
import { useData } from '../contexts/DataContext';
import { format, eachDayOfInterval, parseISO, isValid } from 'date-fns';

export default function TaskRow({ task, subject, dateStr, hideStatus = false, readOnlyCheckbox = false }) {
  const { updateTask, deleteTask, subjects } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editStartDate, setEditStartDate] = useState(task.startDate || '');
  const [editEndDate, setEditEndDate] = useState(task.endDate || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const subjectDropdownRef = useRef(null);
  const inputRef = useRef(null);

  let isCompleted = false;
  if (dateStr) {
    isCompleted = task.status === 'COMPLETED' || (task.completedDates || []).includes(dateStr);
  } else {
    isCompleted = task.status === 'COMPLETED';
    if (!isCompleted && (task.completedDates || []).length > 0) {
      if (task.startDate && task.endDate) {
        try {
          const start = parseISO(task.startDate);
          const end = parseISO(task.endDate);
          if (isValid(start) && isValid(end) && start <= end) {
            const allDates = eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
            const completed = task.completedDates || [];
            if (allDates.length > 0 && allDates.every(d => completed.includes(d))) {
              isCompleted = true;
            }
          }
        } catch (e) {
          // Ignore
        }
      } else if (task.startDate && !task.endDate) {
        if ((task.completedDates || []).includes(task.startDate.substring(0, 10))) {
          isCompleted = true;
        }
      } else if (!task.startDate && task.endDate) {
        if ((task.completedDates || []).includes(task.endDate.substring(0, 10))) {
          isCompleted = true;
        }
      }
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target)) {
        setIsSubjectDropdownOpen(false);
      }
    };
    if (isSubjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSubjectDropdownOpen]);

  const getAllTaskDates = (t) => {
    if (t.startDate && t.endDate) {
      try {
        const start = parseISO(t.startDate);
        const end = parseISO(t.endDate);
        if (isValid(start) && isValid(end) && start <= end) {
          return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
        }
      } catch (e) {}
    } else if (t.startDate) {
      return [t.startDate.substring(0, 10)];
    } else if (t.endDate) {
      return [t.endDate.substring(0, 10)];
    } else if (t.date) {
      return [t.date.substring(0, 10)];
    }
    return [];
  };

  const toggleComplete = () => {
    if (dateStr) {
      let newCompletedDates = [...(task.completedDates || [])];
      if (isCompleted) {
        newCompletedDates = newCompletedDates.filter(d => d !== dateStr);
        const updates = { completedDates: newCompletedDates };
        if (task.status === 'COMPLETED') {
          updates.status = 'IN_PROGRESS';
          // If it was fully completed, populate all other dates so they remain checked
          const allDates = getAllTaskDates(task);
          if (allDates.length > 0) {
            updates.completedDates = allDates.filter(d => d !== dateStr);
          }
        }
        updateTask(task.id, updates);
      } else {
        newCompletedDates.push(dateStr);
        // Check if all dates are now completed
        const allDates = getAllTaskDates(task);
        const isAllCompleted = allDates.length > 0 && allDates.every(d => newCompletedDates.includes(d));
        const updates = { completedDates: newCompletedDates };
        if (isAllCompleted) {
          updates.status = 'COMPLETED';
        }
        updateTask(task.id, updates);
      }
    } else {
      const updates = { status: isCompleted ? 'PENDING' : 'COMPLETED' };
      if (isCompleted) {
        updates.completedDates = [];
      } else {
        updates.completedDates = getAllTaskDates(task);
      }
      updateTask(task.id, updates);
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
          onClick={readOnlyCheckbox ? undefined : toggleComplete}
          style={readOnlyCheckbox ? { cursor: 'not-allowed', opacity: 0.7 } : undefined}
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
          <div 
            ref={subjectDropdownRef}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <div 
              onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
              style={{
                transition: 'all 0.2s',
                borderRadius: '8px',
                padding: '2px',
                border: isSubjectDropdownOpen ? '1px solid var(--border-strong)' : '1px solid transparent',
              }}
              onMouseOver={(e) => {
                if (!isSubjectDropdownOpen) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <SubjectBadge subject={subject} />
            </div>

            {isSubjectDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                padding: '8px',
                zIndex: 50,
                minWidth: '200px',
                maxHeight: '280px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Change Subject
                </div>
                {subjects.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => {
                      if (s.id !== task.subjectId) {
                        updateTask(task.id, { subjectId: s.id, subtopicId: null });
                      }
                      setIsSubjectDropdownOpen(false);
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: s.id === task.subjectId ? 'var(--bg-secondary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (s.id !== task.subjectId) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }}
                    onMouseOut={(e) => {
                      if (s.id !== task.subjectId) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{s.icon}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: s.id === task.subjectId ? '500' : '400' }}>{s.name}</span>
                    {s.id === task.subjectId && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
          {task.subtopicId && subject && subject.subtopics && (
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '8px' }}>
              ↳ {subject.subtopics.find(st => st.id === task.subtopicId)?.name || 'Unknown Sub-topic'}
            </span>
          )}
        </div>
      </td>
      <td className="hide-on-mobile" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
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
      <td className="hide-on-mobile" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
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
      <td className="hide-on-mobile" style={{ width: '120px', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
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
          {showDeleteConfirm && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              marginBottom: '4px',
              backgroundColor: '#fff1f2', // pink-50
              border: '1px solid #fecdd3', // pink-300
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 10px 15px -3px rgba(225, 29, 72, 0.1), 0 4px 6px -4px rgba(225, 29, 72, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 50,
              minWidth: '140px'
            }}>
              <span style={{ fontSize: '13px', color: '#be123c', fontWeight: '500', textAlign: 'center', margin: 0 }}>Delete this task?</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => deleteTask(task.id)}
                  style={{ padding: '4px 0', fontSize: '12px', backgroundColor: '#f43f5e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, fontWeight: '500' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#e11d48'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f43f5e'}
                >
                  Yes
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ padding: '4px 0', fontSize: '12px', backgroundColor: 'transparent', color: '#be123c', border: '1px solid #fda4af', borderRadius: '4px', cursor: 'pointer', flex: 1, fontWeight: '500' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#ffe4e6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  No
                </button>
              </div>
            </div>
          )}
          <button className="btn-icon" title="Delete" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
