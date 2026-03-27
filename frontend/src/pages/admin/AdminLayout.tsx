import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuthStore } from '../../stores/useAuthStore';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': '오버뷰',
  '/admin/users':     '유저 관리',
  '/admin/images':    '배너 관리',
  '/admin/inquiries': '문의 관리',
  '/admin/artworks':      '작품 신고',
  '/admin/artwork-list':  '작품 관리',
  '/admin/payments':  '결제 내역',
};

const AdminLayout = () => {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  const isAdmin = role === 'ADMIN' || String(role) === '100';
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;

  const pageTitle = PAGE_TITLES[location.pathname] || '어드민';

  return (
    <div style={s.layout}>
      <style>{`
        @keyframes adminFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <AdminSidebar />
      <div style={s.right}>
        {/* 탑바 */}
        <header style={s.topbar}>
          <div>
            <p style={s.breadcrumb}>관리자 시스템 · {pageTitle}</p>
            <h1 style={s.pageTitle}>{pageTitle}</h1>
          </div>
          <div style={s.topbarRight}>
            <div style={s.dot} />
            <span style={s.liveText}>실시간 연결됨</span>
          </div>
        </header>

        {/* 콘텐츠 */}
        <main style={s.main}>
          <div style={s.inner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex', minHeight: '100vh',
    background: '#f1f5f9',
    fontFamily: "'Pretendard', 'Inter', -apple-system, sans-serif",
  },
  right: {
    flex: 1, marginLeft: 240,
    display: 'flex', flexDirection: 'column', minHeight: '100vh',
  },
  topbar: {
    position: 'sticky', top: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 36px',
    background: 'rgba(241,245,249,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  breadcrumb: { margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.3 },
  pageTitle: { margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
  },
  liveText: { fontSize: 12, fontWeight: 600, color: '#64748b' },
  main: { flex: 1, padding: '32px 36px 60px' },
  inner: {
    maxWidth: 1280, margin: '0 auto',
    animation: 'adminFadeIn 0.35s ease both',
  },
};

export default AdminLayout;
