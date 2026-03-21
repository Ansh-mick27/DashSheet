// ==========================================
// DashSheet — Sidebar Navigation
// ==========================================
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList, Users,
  LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Overview' },
  { path: '/training', icon: BookOpen, label: 'Training Reports' },
  { path: '/work', icon: ClipboardList, label: 'Work Reports' },
  { path: '/members', icon: Users, label: 'Members' },
];

export default function Sidebar() {
  const { logout, userName } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        {!collapsed && (
          <div className="sidebar__brand">
            <div className="sidebar__logo">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="sidebar__title">DashSheet</h1>
              <p className="sidebar__subtitle">Task Dashboard</p>
            </div>
          </div>
        )}
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        {!collapsed && (
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {(userName || 'A').charAt(0).toUpperCase()}
            </div>
            <span className="sidebar__username">{userName || 'Admin'}</span>
          </div>
        )}
        <button className="sidebar__logout" onClick={logout} aria-label="Logout">
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
