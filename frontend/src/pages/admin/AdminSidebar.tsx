import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

const MENU_ITEMS = [
    { name: '오버뷰', path: '/admin/dashboard', icon: '📊' },
    { name: '유저 관리', path: '/admin/users', icon: '👥' },
    { name: '배너 관리', path: '/admin/images', icon: '🖼️' },
    { name: '문의 관리', path: '/admin/inquiries', icon: '💬' },
    { name: '작품 신고', path: '/admin/artworks', icon: '🛡️' },
    { name: '결제 내역', path: '/admin/payments', icon: '💰' },
];

/**
 * 💎 Slick Admin Sidebar (v5.0 - 시스템 고도화)
 * - 메뉴 설정 분리 및 가독성 개선 (WCAG 대비 상향)
 */
const AdminSidebar = () => {
    const location = useLocation();
    const { logout, nickname } = useAuthStore();

    const handleLogout = () => {
        logout();
    };

    return (
        <aside style={s.sidebar}>
            <div style={s.topSection}>
                <Link to="/" style={s.logoWrapper}>
                    <img
                        src="/Egag_logo-removebg.png"
                        alt="Egag"
                        style={s.logoImg}
                    />
                    <div style={s.badge}>시스템 v2.0</div>
                </Link>
            </div>

            <nav style={s.nav}>
                <p style={s.navLabel}>메인 메뉴</p>
                {MENU_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                ...s.navLink,
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                color: isActive ? '#FFFFFF' : '#CBD5E1', // 대비 향상을 위한 밝은 슬레이트 적용
                            }}
                        >
                            <span style={{...s.iconWrapper, filter: isActive ? 'brightness(1.5)' : 'none'}}>{item.icon}</span>
                            <span style={{ fontWeight: isActive ? 700 : 500, color: isActive ? '#FFF' : '#CBD5E1' }}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div style={s.bottomSection}>
                <div style={s.userInfo}>
                    <div style={s.avatar}>{nickname?.charAt(0) || 'A'}</div>
                    <div style={s.userText}>
                        <div style={s.userRole}>최고 관리자</div>
                        <div style={s.userNickname}>{nickname || '관리자'}</div>
                    </div>
                </div>
                <div style={s.actionGroup}>
                    <Link to="/" style={s.miniBtn}>🏠</Link>
                    <button onClick={handleLogout} style={s.logoutBtn}>
                        <span style={s.logoutIcon}>🚪</span> 로그아웃
                    </button>
                </div>
            </div>
        </aside>
    );
};

const s: Record<string, React.CSSProperties> = {
    sidebar: {
        width: '240px', backgroundColor: '#0F172A', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)', borderRight: '1px solid #1E293B'
    },
    topSection: { padding: '40px 25px 30px' },
    logoWrapper: { textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    logoImg: { width: '90px', height: 'auto', marginBottom: '12px' },
    badge: { 
        fontSize: '10px', fontWeight: 900, color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        padding: '2px 8px', borderRadius: '6px', letterSpacing: '1px' 
    },
    nav: { flex: 1, padding: '0 15px' },
    navLabel: { fontSize: '11px', fontWeight: 900, color: '#475569', margin: '0 0 15px 10px', letterSpacing: '1px' },
    navLink: {
        display: 'flex', alignItems: 'center', padding: '12px 15px', borderRadius: '12px',
        textDecoration: 'none', fontSize: '14px', marginBottom: '4px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', gap: '12px'
    },
    iconWrapper: { fontSize: '18px', width: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    bottomSection: { padding: '20px', borderTop: '1px solid #1E293B' },
    userInfo: { 
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', 
        padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '14px' 
    },
    avatar: { 
        width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#334155', 
        color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' 
    },
    userText: { display: 'flex', flexDirection: 'column' },
    userNickname: { margin: 0, fontSize: '13px', fontWeight: 700, color: '#F1F5F9' },
    userRole: { margin: 0, fontSize: '10px', color: '#64748B', fontWeight: 600 },
    actionGroup: { display: 'flex', gap: '8px' },
    miniBtn: { 
        padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' 
    },
    logoutBtn: { 
        flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'transparent', color: '#94A3B8', fontSize: '11px', fontWeight: 800, cursor: 'pointer', transition: '0.2s' 
    }
};

export default AdminSidebar;