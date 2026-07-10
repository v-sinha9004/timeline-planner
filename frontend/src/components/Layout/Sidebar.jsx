import { NavLink } from 'react-router-dom';
import { Calendar, CalendarRange, CalendarDays, ListTodo, LibraryBig, Timer } from 'lucide-react';
import SyncIndicator from '../SyncIndicator';
import { useUser } from '../../contexts/UserContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { activeUser } = useUser();
  const imageSrc = activeUser === 'Vishal' ? '/have_a_nice_day_blue.jpg' : '/have_a_nice_day.jpg';
  return (
    <>
      <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}></div>
      <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <img src={imageSrc} alt="Have a nice day" className="sidebar-image" />
        <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✨ UPSC Planner
        </h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
          <Calendar size={18} /> Today
        </NavLink>
        <NavLink to="/weekly" onClick={() => setIsOpen(false)} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <CalendarRange size={18} /> Weekly
        </NavLink>
        <NavLink to="/monthly" onClick={() => setIsOpen(false)} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <CalendarDays size={18} /> Monthly
        </NavLink>
        <NavLink to="/tasks" onClick={() => setIsOpen(false)} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <ListTodo size={18} /> All Tasks
        </NavLink>
        <NavLink to="/subjects" onClick={() => setIsOpen(false)} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LibraryBig size={18} /> Subjects
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <SyncIndicator />
      </div>
    </div>
    </>
  );
}
