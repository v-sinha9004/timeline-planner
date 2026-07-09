import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus } from 'lucide-react';

export default function SubjectsView() {
  const { subjects } = useData();

  return (
    <div className="subjects-view">
      <div className="subjects-grid">
        {subjects.map(subject => (
          <div key={subject.id} className="subject-card">
            <div className="subject-color-bar" style={{ backgroundColor: subject.color }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
    </div>
  );
}
