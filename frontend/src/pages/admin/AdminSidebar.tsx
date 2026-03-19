import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

const AdminSidebar = () => {
    const location = useLocation();
    const { isAuthenticated, role, logout } = useAuthStore();

    const isAdmin = role === 'ADMIN' || String(role) === '100';

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    const menuItems = [
        { path: '/admin/dashboard', name: '📊 대시보드', icon: '📈' },
        { path: '/admin/users', name: '🪙 토큰 관리', icon: '🗂️' },
        { path: '/admin/payments', name: '💳 결제 내역', icon: '💰' },
        { path: '/admin/all-users', name: '👥 유저 관리', icon: '👤' },
    ];

    return (
        <div style={s.layout}>
            <aside style={s.sidebar}>
                <div style={s.logoSection}>
                    <h2 style={s.logo}>이그에그 🐣</h2>
                    <p style={s.subLogo}>ADMIN PANEL</p>
                </div>

                <nav style={s.nav}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    ...s.navLink,
                                    backgroundColor: isActive ? '#F3E8FF' : 'transparent',
                                    color: isActive ? '#7C3AED' : '#6B7280',
                                    fontWeight: isActive ? 800 : 500,
                                }}
                            >
                                <span style={{ marginRight: '10px' }}>{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* 🛠️ 하단 버튼 영역 수정 */}
                <div style={s.footer}>
                    <Link to="/" style={s.homeBtn}>
                        🏠 사용자 홈으로
                    </Link>
                    <button onClick={logout} style={s.logoutBtn}>
                        🚪 로그아웃
                    </button>
                </div>
            </aside>

            <main style={s.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' },
    sidebar: {
        width: '260px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100
    },
    logoSection: { padding: '40px 30px', textAlign: 'center' },
    logo: { fontSize: '24px', fontWeight: 900, color: '#4C1D95', margin: 0 },
    subLogo: { fontSize: '12px', color: '#9CA3AF', fontWeight: 700, marginTop: '5px' },
    nav: { flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px' },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        padding: '14px 20px',
        borderRadius: '15px',
        textDecoration: 'none',
        fontSize: '15px',
        transition: 'all 0.2s'
    },
    // ⭐ Footer 스타일 수정: 버튼 간격 조정
    footer: {
        padding: '20px',
        borderTop: '1px solid #F3F4F6',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    // ⭐ 홈으로 가기 버튼 스타일 추가
    homeBtn: {
        display: 'block',
        textAlign: 'center',
        padding: '12px',
        borderRadius: '12px',
        backgroundColor: '#F3F4F6',
        color: '#4B5563',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 700,
        transition: '0.2s',
        border: '1px solid #E5E7EB'
    },
    logoutBtn: {
        width: '100%',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid #FCA5A5',
        color: '#EF4444',
        backgroundColor: 'transparent',
        fontWeight: 700,
        cursor: 'pointer',
        transition: '0.2s'
    },
    mainContent: {
        flex: 1,
        marginLeft: '260px',
        padding: '20px',
        minHeight: '100vh'
    }
};

export default AdminSidebar;