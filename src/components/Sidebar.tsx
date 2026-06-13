// ==========================================
// DashSheet — Sidebar Navigation
// ==========================================
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList, Users,
  LogOut, ChevronLeft, ChevronRight, Settings,
  Package, Briefcase, Sun, Moon, Search, ClipboardPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

const ADMIN_NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Overview' },
  { path: '/training', icon: BookOpen, label: 'Training Reports' },
  { path: '/work', icon: ClipboardList, label: 'Work Reports' },
  { path: '/members', icon: Users, label: 'Members' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/placement', icon: Briefcase, label: 'Placement' },
  { path: '/portal', icon: ClipboardPlus, label: 'Portal' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const PORTAL_NAV_ITEMS = [
  { path: '/portal', icon: ClipboardPlus, label: 'Portal' },
];

interface SidebarProps {
  onSearch?: (q: string) => void;
}

export default function Sidebar({ onSearch }: SidebarProps) {
  const { logout, member } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();
  const navItems = member?.role === 'Admin' ? ADMIN_NAV_ITEMS : PORTAL_NAV_ITEMS;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/members?q=${encodeURIComponent(searchVal.trim())}`);
      if (onSearch) onSearch(searchVal.trim());
    }
  };

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
              <p className="sidebar__subtitle">CDC Dashboard</p>
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

      {!collapsed && member?.role === 'Admin' && (
        <form className="sidebar__search" onSubmit={handleSearch}>
          <Search size={14} className="sidebar__search-icon" />
          <input
            type="text"
            placeholder="Search member..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            className="sidebar__search-input"
          />
        </form>
      )}

      <nav className="sidebar__nav">
        {navItems.map(item => (
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
        <button
          className="sidebar__theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {!collapsed && (
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {(member?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="sidebar__username">{member?.name || 'User'}</span>
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
