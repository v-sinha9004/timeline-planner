import { useLocation } from 'react-router-dom';
import { Plus, Menu } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { format } from 'date-fns';
import { useState } from 'react';
import TaskModal from '../TaskModal';
import { useUser } from '../../contexts/UserContext';

export default function TopBar({ onMenuClick }) {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activeUser, setActiveUser } = useUser();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Today';
      case '/weekly': return 'Weekly Plan';
      case '/monthly': return 'Monthly Overview';
      case '/tasks': return 'All Tasks';
      case '/subjects': return 'Subjects';
      case '/visualize': return 'Visualize Tasks';
      default: return 'UPSC Study Planner';
    }
  };

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <h2 className="topbar-title">{getPageTitle()}</h2>
      </div>

      <div className="topbar-center" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </div>

      <div className="topbar-actions">
        <div className="user-toggle">
          <div
            className="user-toggle-slider"
            style={{
              transform: activeUser === 'Vishal' ? 'translateX(0)' : 'translateX(100%)'
            }}
          />
          <button
            className={`user-toggle-btn ${activeUser === 'Vishal' ? 'active' : ''}`}
            onClick={() => setActiveUser('Vishal')}
          >
            Vishal
          </button>
          <button
            className={`user-toggle-btn ${activeUser === 'Aradhana' ? 'active' : ''}`}
            onClick={() => setActiveUser('Aradhana')}
          >
            Aradhana
          </button>
        </div>
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
