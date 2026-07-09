import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../contexts/DataContext';
import { X, Plus, Trash2, Check } from 'lucide-react';

export default function SubjectModal({ isOpen, onClose, subjectToEdit = null }) {
  const { addSubject, updateSubject, deleteSubject } = useData();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📚');
  const [color, setColor] = useState('#3b82f6');
  const [subtopics, setSubtopics] = useState([]);
  const [newSubtopic, setNewSubtopic] = useState('');

  const newSubtopicInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (subjectToEdit) {
        setName(subjectToEdit.name || '');
        setIcon(subjectToEdit.icon || '📚');
        setColor(subjectToEdit.color || '#3b82f6');
        setSubtopics(subjectToEdit.subtopics || []);
      } else {
        setName('');
        setIcon('📚');
        setColor('#3b82f6');
        setSubtopics([]);
      }
      setNewSubtopic('');
    }
  }, [isOpen, subjectToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Subject name is required');
      return;
    }

    const subjectData = {
      name: name.trim(),
      icon,
      color,
      subtopics
    };

    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, subjectData);
    } else {
      addSubject({ ...subjectData, order: 0 }); // order logic can be improved later
    }
    
    onClose();
  };

  const handleAddSubtopic = () => {
    if (newSubtopic.trim()) {
      setSubtopics([
        ...subtopics, 
        { id: crypto.randomUUID(), name: newSubtopic.trim(), completed: false }
      ]);
      setNewSubtopic('');
      if (newSubtopicInputRef.current) {
        newSubtopicInputRef.current.focus();
      }
    }
  };

  const toggleSubtopic = (id) => {
    setSubtopics(subtopics.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const deleteSubtopic = (id) => {
    setSubtopics(subtopics.filter(st => st.id !== id));
  };

  const handleDeleteSubject = () => {
    if (confirm(`Are you sure you want to delete ${name}? This will not delete associated tasks.`)) {
      deleteSubject(subjectToEdit.id);
      onClose();
    }
  };

  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
    '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b'
  ];

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{subjectToEdit ? 'Edit Subject' : 'New Subject'}</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body flex-col gap-lg">
            
            <div className="flex gap-md">
              <div className="flex-col gap-sm" style={{ width: '80px' }}>
                <label style={{ fontWeight: 500 }}>Icon</label>
                <input 
                  type="text" 
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  style={{ textAlign: 'center', fontSize: '20px' }}
                  maxLength={2}
                />
              </div>
              <div className="flex-col gap-sm" style={{ flex: 1 }}>
                <label style={{ fontWeight: 500 }}>Subject Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Indian History"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="flex-col gap-sm">
              <label style={{ fontWeight: 500 }}>Color</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {presetColors.map(c => (
                  <div 
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      cursor: 'pointer',
                      border: color === c ? '2px solid var(--text)' : '2px solid transparent',
                      boxShadow: color === c ? '0 0 0 2px var(--bg)' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            <hr style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

            <div className="flex-col gap-sm">
              <label style={{ fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                <span>Sub-topics</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 400 }}>
                  {subtopics.filter(s => s.completed).length} / {subtopics.length} completed
                </span>
              </label>
              
              <div className="subtopics-list">
                {subtopics.map(st => (
                  <div key={st.id} className={`subtopic-item ${st.completed ? 'completed' : ''}`}>
                    <div 
                      className={`custom-checkbox ${st.completed ? 'checked' : ''}`}
                      onClick={() => toggleSubtopic(st.id)}
                    >
                      {st.completed && <Check size={14} />}
                    </div>
                    <span className="subtopic-title" style={{ flex: 1, textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-secondary)' : 'inherit' }}>
                      {st.name}
                    </span>
                    <button type="button" className="btn-icon" onClick={() => deleteSubtopic(st.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                <div className="subtopic-add-row" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input 
                    ref={newSubtopicInputRef}
                    type="text" 
                    value={newSubtopic}
                    onChange={e => setNewSubtopic(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtopic();
                      }
                    }}
                    placeholder="Add a new sub-topic..."
                    style={{ flex: 1, padding: '6px 12px', fontSize: '14px' }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleAddSubtopic}
                    disabled={!newSubtopic.trim()}
                    style={{ padding: '6px 12px' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

          </div>
          
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {subjectToEdit && (
                <button type="button" className="btn" style={{ color: '#ef4444', border: '1px solid #fca5a5', backgroundColor: '#fef2f2' }} onClick={handleDeleteSubject}>
                  Delete Subject
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn" style={{ border: '1px solid var(--border)' }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Subject</button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
