import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuthStore } from '../../stores/useAuthStore';

/**
 * 🎨 Slick Admin Layout
 * - Balanced whitespace, unified container, and high-end feel.
 */
const AdminLayout = () => {
    const { isAuthenticated, role } = useAuthStore();

    // 🛡️ 권한 체크 (ADMIN 또는 100)
    const isAdmin = role === 'ADMIN' || String(role) === '100';

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={s.layout}>
            {/* 📁 사이드바 고정 */}
            <AdminSidebar />
            
            {/* 🚀 콘텐츠 영역 */}
            <main style={s.main}>
                <div style={s.innerContainer}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    layout: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC', // Very light slate for premium clarity
        fontFamily: "'Inter', 'Pretendard', -apple-system, sans-serif"
    },
    main: {
        flex: 1,
        marginLeft: '240px', // 사이드바 너비와 동일
        width: 'calc(100% - 240px)',
        padding: '20px',
        boxSizing: 'border-box'
    },
    innerContainer: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '20px'
    }
};

export default AdminLayout;