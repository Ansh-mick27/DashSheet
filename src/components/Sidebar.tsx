// ==========================================
// DashSheet — Sidebar Navigation
// ==========================================
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, ClipboardList, Users,
  LogOut, ChevronLeft, ChevronRight, Settings,
  Package, Briefcase, Sun, Moon, Search, ClipboardPlus, ShieldCheck, FileText,
  ClipboardCheck, CalendarDays, Menu, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useMemo, useState } from 'react';
import { getAdminAccess } from '../config/adminAccess';
import { MemberRole } from '../types';

const ALL_ADMIN_NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Overview', roles: null },
  { path: '/training', icon: BookOpen, label: 'Session Reports', roles: ['Trainer'] as MemberRole[] },
  { path: '/work', icon: ClipboardList, label: 'Daily Work Reports', roles: ['Trainer'] as MemberRole[] },
  { path: '/members', icon: Users, label: 'Members', roles: null },
  { path: '/inventory', icon: Package, label: 'Inventory', roles: ['OfficeAdmin'] as MemberRole[] },
  { path: '/inventory-stock', icon: ClipboardList, label: 'Stock Overview', roles: ['OfficeAdmin'] as MemberRole[] },
  { path: '/placement', icon: Briefcase, label: 'CRP Process', roles: ['Placement'] as MemberRole[] },
  { path: '/placement-work', icon: FileText, label: 'Placement Work', roles: ['Placement'] as MemberRole[] },
  { path: '/office-daily', icon: ClipboardCheck, label: 'Office Daily', roles: ['OfficeAdmin'] as MemberRole[] },
  { path: '/office-weekly', icon: CalendarDays, label: 'Office Weekly', roles: ['OfficeAdmin'] as MemberRole[] },
  { path: '/portal', icon: ClipboardPlus, label: 'Portal', roles: null },
  { path: '/settings', icon: Settings, label: 'Settings', roles: null },
];

const SUPERADMIN_EXTRA = { path: '/admin', icon: ShieldCheck, label: 'SuperAdmin', roles: null };

const PORTAL_NAV_ITEMS = [
  { path: '/portal', icon: ClipboardPlus, label: 'Portal', roles: null },
];

interface SidebarProps {
  onSearch?: (q: string) => void;
}

export default function Sidebar({ onSearch }: SidebarProps) {
  const { logout, member } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  const navItems = useMemo(() => {
    if (member?.role === 'SuperAdmin') {
      return [...ALL_ADMIN_NAV_ITEMS, SUPERADMIN_EXTRA];
    }
    if (member?.role === 'Admin') {
      const access = getAdminAccess(member.name);
      if (!access) return ALL_ADMIN_NAV_ITEMS;
      return ALL_ADMIN_NAV_ITEMS.filter(item =>
        item.roles === null || item.roles.some(r => (access.visibleRoles as string[]).includes(r))
      );
    }
    return PORTAL_NAV_ITEMS;
  }, [member]);

  const memberTitle = useMemo(() => {
    if (!member || member.role !== 'Admin') return null;
    return getAdminAccess(member.name)?.title ?? null;
  }, [member]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/members?q=${encodeURIComponent(searchVal.trim())}`);
      if (onSearch) onSearch(searchVal.trim());
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar__overlay${mobileOpen ? ' sidebar__overlay--active' : ''}`}
        onClick={closeMobile}
      />

      {/* Mobile hamburger trigger (hidden when sidebar open) */}
      <button
        className={`sidebar__mobile-trigger${mobileOpen ? ' sidebar__mobile-trigger--hidden' : ''}`}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>

      <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}${mobileOpen ? ' sidebar--mobile-open' : ''}`}>
        <div className="sidebar__header">
          {!collapsed && (
            <div className="sidebar__brand">
              <div className="sidebar__logo">
                <LayoutDashboard size={28} />
              </div>
              <div>
                <h1 className="sidebar__title">CDC-DASHSHEET</h1>
                <p className="sidebar__subtitle">CDC Dashboard</p>
              </div>
            </div>
          )}
          {/* Desktop: collapse toggle. Mobile: close button */}
          <button
            className="sidebar__toggle sidebar__toggle--desktop"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button
            className="sidebar__toggle sidebar__toggle--mobile"
            onClick={closeMobile}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {!collapsed && (member?.role === 'Admin' || member?.role === 'SuperAdmin') && (
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
              onClick={closeMobile}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                <span className="sidebar__username">{member?.name || 'User'}</span>
                {memberTitle && (
                  <span style={{ fontSize: 10, opacity: 0.65, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {memberTitle}
                  </span>
                )}
              </div>
            </div>
          )}
          <button className="sidebar__logout" onClick={() => { logout(); closeMobile(); }} aria-label="Logout">
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
