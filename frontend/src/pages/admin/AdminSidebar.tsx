import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  LayoutDashboard, Users, Image, MessageSquare, ShieldAlert,
  CreditCard, LogOut, Home, ChevronRight, Palette
} from 'lucide-react';

const MENU_ITEMS = [
  { name: '오버뷰',    path: '/admin/dashboard',    icon: LayoutDashboard },
  { name: '유저 관리',  path: '/admin/users',         icon: Users },
  { name: '결제 내역',  path: '/admin/payments',      icon: CreditCard },
  { name: '작품 관리',  path: '/admin/artwork-list',  icon: Palette },
  { name: '배너 관리',  path: '/admin/images',        icon: Image },
  { name: '작품 신고',  path: '/admin/artworks',      icon: ShieldAlert },
  { name: '문의 관리',  path: '/admin/inquiries',     icon: MessageSquare },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, nickname } = useAuthStore();

  return (
    <aside style={s.sidebar}>
      <style>{`
        .admin-nav-link { transition: all 0.2s ease; }
        .admin-nav-link:hover { background: rgba(255,255,255,0.08) !important; }
        .admin-logout-btn:hover { background: rgba(239,68,68,0.12) !important; color: #f87171 !important; }
        .admin-home-btn:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>

      {/* 로고 */}
      <div style={s.top}>
        <Link to="/" style={s.logoLink}>
          <img src="/Egag_logo-removebg.png" alt="Egag" style={s.logo} />
        </Link>
        <div style={s.adminBadge}>ADMIN</div>
      </div>

      {/* 메뉴 */}
      <nav style={s.nav}>
        <p style={s.navLabel}>메인 메뉴</p>
        {MENU_ITEMS.map(({ name, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="admin-nav-link"
              style={{
                ...s.navLink,
                background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))' : 'transparent',
                borderLeft: isActive ? '3px solid #818cf8' : '3px solid transparent',
                color: isActive ? '#e0e7ff' : '#b8cce0',
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ flex: 1, fontWeight: isActive ? 700 : 500, fontSize: 15 }}>{name}</span>
              {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>

      {/* 하단 */}
      <div style={s.bottom}>
        <div style={s.userCard}>
          <div style={s.avatar}>{nickname?.charAt(0)?.toUpperCase() || 'A'}</div>
          <div>
            <p style={s.userName}>{nickname || '관리자'}</p>
            <p style={s.userRole}>최고 관리자</p>
          </div>
        </div>
        <div style={s.actions}>
          <button className="admin-home-btn" style={s.iconBtn} onClick={() => navigate('/')} title="홈으로">
            <Home size={15} />
          </button>
          <button className="admin-logout-btn" style={s.logoutBtn} onClick={logout}>
            <LogOut size={14} />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

const s: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 240, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100,
    display: 'flex', flexDirection: 'column',
    background: 'linear-gradient(180deg, #152a47 0%, #0f2038 100%)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
  },
  top: {
    padding: '48px 20px 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logoLink: { textDecoration: 'none' },
  logo: { width: 120, height: 'auto' },
  adminBadge: {
    fontSize: 9, fontWeight: 900, letterSpacing: 3,
    color: '#fff',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    boxShadow: '0 2px 10px rgba(99,102,241,0.4)',
    padding: '4px 14px', borderRadius: 20,
  },
  nav: { flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 8 },
  navLabel: {
    fontSize: 13, fontWeight: 700, color: '#7a95b0',
    letterSpacing: 1.5, margin: '0 4px 12px', textTransform: 'uppercase',
  },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 10,
    textDecoration: 'none', transition: 'all 0.2s',
  },
  bottom: {
    padding: '16px 12px 20px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 12,
    background: 'rgba(255,255,255,0.08)',
  },
  avatar: {
    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 800,
  },
  userName: { margin: 0, fontSize: 13, fontWeight: 700, color: '#f1f5f9' },
  userRole: { margin: 0, fontSize: 10, color: '#7a95b0', fontWeight: 500 },
  actions: { display: 'flex', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
    background: 'rgba(255,255,255,0.06)', border: 'none',
    color: '#94a3b8', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
  },
  logoutBtn: {
    flex: 1, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
    background: 'transparent', color: '#b8cce0', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, transition: 'all 0.2s',
  },
};

export default AdminSidebar;
