import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { format } from 'date-fns';
import { useState } from 'react';
import TaskModal from '../TaskModal';

export default function TopBar() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Today';
      case '/weekly': return 'Weekly Plan';
      case '/monthly': return 'Monthly Overview';
      case '/tasks': return 'All Tasks';
      case '/subjects': return 'Subjects';
      default: return 'UPSC Study Planner';
    }
  };

  return (
    <div className="topbar">
      <h2 className="topbar-title">{getPageTitle()}</h2>
      
      <div className="topbar-center" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </div>

      <div className="topbar-actions">
        <button 
          className="btn btn-primary" 
          style={{ padding: '8px', borderRadius: '50%' }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} />
        </button>
        <ThemeToggle />
      </div>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
