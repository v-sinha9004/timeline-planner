import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../contexts/DataContext';
import { X, Plus, Trash2, Check } from 'lucide-react';

export default function SubtopicsModal({ isOpen, onClose, subject = null }) {
  const { updateSubject } = useData();

  const [subtopics, setSubtopics] = useState([]);
  const [newSubtopic, setNewSubtopic] = useState('');

  const newSubtopicInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (subject) {
        setSubtopics(subject.subtopics || []);
      } else {
        setSubtopics([]);
      }
      setNewSubtopic('');
    }
  }, [isOpen, subject]);

  if (!isOpen || !subject) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSubject(subject.id, { subtopics });
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

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>{subject.icon}</span>
            <h3 style={{ margin: 0 }}>{subject.name} - Sub-topics</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body flex-col gap-lg">
            
            <div className="flex-col gap-sm">
              <label style={{ fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                <span>Sub-topics</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 400 }}>
                  {subtopics.filter(s => s.completed).length} / {subtopics.length} completed
                </span>
              </label>
              
              <div className="subtopics-list" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {subtopics.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic', margin: '8px 0' }}>
                    No sub-topics added yet.
                  </p>
                ) : (
                  subtopics.map(st => (
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
                  ))
                )}
              </div>
                
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
          
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn" style={{ border: '1px solid var(--border)' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
