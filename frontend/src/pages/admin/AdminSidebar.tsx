import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

const AdminSidebar = () => {
    const { isAuthenticated, role, logout } = useAuthStore();
    const location = useLocation();

    // 🛡️ 보안 체크: 관리자가 아니면 아예 접근 불가
    console.log("--- 어드민 체크 ---");
    console.log("인증여부(isAuthenticated):", isAuthenticated);
    console.log("내 역할(role):", role);
    console.log("토큰(accessToken):", accessToken);

    if (!isAuthenticated || role !== 'ADMIN') {
        console.error("❌ 조건 불일치로 홈으로 튕깁니다!");
        return <Navigate to="/" replace />;
    }

    // 메뉴 아이템 설정
    const menuItems = [
        { path: '/admin/dashboard', name: '📊 대시보드', icon: '📈' },
        { path: '/admin/users', name: '👥 유저 관리', icon: '👤' },
        { path: '/admin/payments', name: '💳 결제 내역', icon: '💰' },
        { path: '/admin/all-users', name: '📋 전체 목록', icon: '🗂️' },
    ];

    return (
        <div style={s.layout}>
            {/* ⬅️ 사이드바 영역 */}
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

                <div style={s.footer}>
                    <button onClick={logout} style={s.logoutBtn}>🚪 로그아웃</button>
                </div>
            </aside>

            {/* ➡️ 콘텐츠 영역 (실제 페이지 내용이 나오는 곳) */}
            <main style={s.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};

// 🎨 사이드바 전용 스타일
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
    footer: { padding: '30px', borderTop: '1px solid #F3F4F6' },
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
        marginLeft: '260px', // 사이드바 너비만큼 왼쪽 여백
        padding: '20px',
        minHeight: '100vh'
    }
};

export default AdminSidebar;