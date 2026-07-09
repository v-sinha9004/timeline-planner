import { NavLink } from 'react-router-dom';
import { Calendar, CalendarRange, CalendarDays, ListTodo, LibraryBig, Timer } from 'lucide-react';
import SyncIndicator from '../SyncIndicator';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/have_a_nice_day.jpg" alt="Have a nice day" className="sidebar-image" />
        <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✨ UPSC Planner
        </h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
          <Calendar size={18} /> Today
        </NavLink>
        <NavLink to="/weekly" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <CalendarRange size={18} /> Weekly
        </NavLink>
        <NavLink to="/monthly" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <CalendarDays size={18} /> Monthly
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <ListTodo size={18} /> All Tasks
        </NavLink>
        <NavLink to="/subjects" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LibraryBig size={18} /> Subjects
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <SyncIndicator />
      </div>
    </div>
  );
}
