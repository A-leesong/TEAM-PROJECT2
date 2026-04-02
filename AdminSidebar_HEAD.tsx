import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

const MENU_ITEMS = [
    { name: '?ㅻ쾭酉?, path: '/admin/dashboard', icon: '?뱤' },
    { name: '?좎? 愿由?, path: '/admin/users', icon: '?뫁' },
    { name: '諛곕꼫 愿由?, path: '/admin/images', icon: '?뼹截? },
    { name: '臾몄쓽 愿由?, path: '/admin/inquiries', icon: '?뮠' },
    { name: '?묓뭹 ?좉퀬', path: '/admin/artworks', icon: '?썳截? },
    { name: '寃곗젣 ?댁뿭', path: '/admin/payments', icon: '?뮥' },
];

/**
 * ?뭿 Slick Admin Sidebar (v5.0 - ?쒖뒪??怨좊룄??
 * - 硫붾돱 ?ㅼ젙 遺꾨━ 諛?媛?낆꽦 媛쒖꽑 (WCAG ?鍮??곹뼢)
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
                    <div style={s.badge}>?쒖뒪??v2.0</div>
                </Link>
            </div>

            <nav style={s.nav}>
                <p style={s.navLabel}>硫붿씤 硫붾돱</p>
                {MENU_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                ...s.navLink,
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                color: isActive ? '#FFFFFF' : '#CBD5E1', // ?鍮??μ긽???꾪븳 諛앹? ?щ젅?댄듃 ?곸슜
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
                        <div style={s.userRole}>理쒓퀬 愿由ъ옄</div>
                        <div style={s.userNickname}>{nickname || '愿由ъ옄'}</div>
                    </div>
                </div>
                <div style={s.actionGroup}>
                    <Link to="/" style={s.miniBtn}>?룧</Link>
                    <button onClick={handleLogout} style={s.logoutBtn}>
                        <span style={s.logoutIcon}>?슞</span> 濡쒓렇?꾩썐
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
