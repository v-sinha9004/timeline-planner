import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Edit2 } from 'lucide-react';
import SubjectModal from '../components/SubjectModal';
import SubtopicsModal from '../components/SubtopicsModal';

export default function SubjectsView() {
  const { subjects } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [isSubtopicsModalOpen, setIsSubtopicsModalOpen] = useState(false);
  const [subjectForSubtopics, setSubjectForSubtopics] = useState(null);

  const openNewModal = () => {
    setSubjectToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (e, subject) => {
    e.stopPropagation();
    setSubjectToEdit(subject);
    setIsModalOpen(true);
  };

  const openSubtopicsModal = (subject) => {
    setSubjectForSubtopics(subject);
    setIsSubtopicsModalOpen(true);
  };

  return (
    <div className="subjects-view">
      <div className="subjects-grid">
        {subjects.map(subject => (
          <div key={subject.id} className="subject-card" onClick={() => openSubtopicsModal(subject)} style={{ cursor: 'pointer', position: 'relative' }}>
            <div className="subject-color-bar" style={{ backgroundColor: subject.color }} />
            
            <button 
              className="btn-icon" 
              onClick={(e) => openEditModal(e, subject)}
              style={{ position: 'absolute', top: '12px', right: '12px', opacity: 0.6 }}
              title="Edit Subject Details"
            >
              <Edit2 size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingRight: '24px' }}>
              <span style={{ fontSize: '32px' }}>{subject.icon}</span>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{subject.name}</h3>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
              {subject.subtopics?.length || 0} sub-topics
            </p>
            
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${subject.subtopics?.length ? (subject.subtopics.filter(s => s.completed).length / subject.subtopics.length) * 100 : 0}%`,
                  backgroundColor: subject.color 
                }} 
              />
            </div>
          </div>
        ))}
        
        <div 
          className="subject-card" 
          onClick={openNewModal}
          style={{ 
            border: '2px dashed var(--border-strong)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'transparent',
            color: 'var(--accent)'
          }}
        >
          <Plus size={32} style={{ marginBottom: '8px' }} />
          <h3 style={{ margin: 0 }}>Add Subject</h3>
        </div>
      </div>

      <SubjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        subjectToEdit={subjectToEdit} 
      />

      <SubtopicsModal
        isOpen={isSubtopicsModalOpen}
        onClose={() => setIsSubtopicsModalOpen(false)}
        subject={subjectForSubtopics}
      />
    </div>
  );
}
