import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

// --- 인터페이스 정의 ---
interface DailySale {
    date: string;
    amount: number;
}

interface ProductData {
    name: string;
    count: number;
}

interface PaymentData {
    name: string;
    value: number;
}

interface DashboardStats {
    totalUsers: number;
    todayNewUsers: number;
    totalSales: number;
    todaySales: number;
    suspendedUsers: number;
    activeUsers: number;
    dailySales: DailySale[];
    topProducts: ProductData[];
    paymentMethodRatio: PaymentData[];
    recentUsers: { id: string; nickname: string; email: string; createdAt: string }[];
}

const COLORS = ['#FFEB00', '#0050FF', '#7C3AED', '#10B981'];

// --- 차트 컴포넌트 (외부 분리) ---
const RenderBarChart = ({ data }: { data: ProductData[] }) => (
    <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: '#F3F4F6' }} />
            <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
);

const RenderPieChart = ({ data }: { data: PaymentData[] }) => (
    <ResponsiveContainer width="100%" height={250}>
        <PieChart>
            <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
            >
                {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
        </PieChart>
    </ResponsiveContainer>
);

// --- 메인 컴포넌트 ---
const AdminDashboard = () => {
    const { isAuthenticated, role, nickname, accessToken } = useAuthStore();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/dashboard/stats', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            // ✅ 백엔드 데이터 전용 세팅 (샘플 데이터 삭제됨)
            setStats(res.data);
        } catch (err) {
            console.error("통계 데이터 로딩 실패:", err);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        const isAdmin = role === 'ADMIN' || String(role) === '100';
        if (isAuthenticated && isAdmin) {
            void fetchStats();
        }
    }, [isAuthenticated, role, fetchStats]);

    if (!isAuthenticated || (role !== 'ADMIN' && String(role) !== '100')) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={s.container}>
            <header style={s.header}>
                <h1 style={s.title}>📊 서비스 대시보드</h1>
                <p style={s.meta}>환영합니다, <strong>{nickname}</strong> 관리자님!</p>
            </header>

            {loading ? (
                <div style={s.emptyState}>데이터를 분석하고 있습니다... 🔄</div>
            ) : stats ? (
                <>
                    {/* 상단 요약 카드 섹션 */}
                    <div style={s.grid}>
                        <div style={s.card}>
                            <h3 style={s.cardLabel}>👥 전체 유저</h3>
                            <div style={s.cardValue}>{stats.totalUsers.toLocaleString()} 명</div>
                            <span style={s.cardSubText}>오늘 신규: {stats.todayNewUsers}명</span>
                        </div>
                        <div style={{ ...s.card, borderLeft: '6px solid #8B5CF6' }}>
                            <h3 style={s.cardLabel}>💰 누적 매출</h3>
                            <div style={{ ...s.cardValue, color: '#7C3AED' }}>₩ {stats.totalSales.toLocaleString()}</div>
                            <span style={s.cardSubText}>오늘 매출: ₩ {stats.todaySales.toLocaleString()}</span>
                        </div>
                        <div style={s.card}>
                            <h3 style={s.cardLabel}>✅ 활성 유저</h3>
                            <div style={{ ...s.cardValue, color: '#10B981' }}>{stats.activeUsers.toLocaleString()} 명</div>
                        </div>
                        <div style={{ ...s.card, borderLeft: '6px solid #EF4444' }}>
                            <h3 style={s.cardLabel}>🚫 정지 유저</h3>
                            <div style={{ ...s.cardValue, color: '#EF4444' }}>{stats.suspendedUsers.toLocaleString()} 명</div>
                        </div>
                    </div>

                    {/* 차트 섹션 */}
                    <div style={s.chartSection}>
                        <div style={s.chartBox}>
                            <h3 style={s.sectionSubTitle}>🔥 인기 패키지 순위</h3>
                            {stats.topProducts?.length > 0 ? (
                                <RenderBarChart data={stats.topProducts} />
                            ) : (
                                <div style={s.noData}>데이터가 없습니다.</div>
                            )}
                        </div>
                        <div style={s.chartBox}>
                            <h3 style={s.sectionSubTitle}>💳 결제 수단 비율</h3>
                            {stats.paymentMethodRatio?.length > 0 ? (
                                <RenderPieChart data={stats.paymentMethodRatio} />
                            ) : (
                                <div style={s.noData}>데이터가 없습니다.</div>
                            )}
                        </div>
                    </div>

                    {/* 유저 리스트 섹션 */}
                    <div style={s.listSection}>
                        <h3 style={s.sectionSubTitle}>🆕 최근 가입 유저 (24h)</h3>
                        <div style={s.tableWrapper}>
                            <table style={s.table}>
                                <thead>
                                <tr>
                                    <th style={s.th}>닉네임</th>
                                    <th style={s.th}>이메일</th>
                                    <th style={{ ...s.th, textAlign: 'center' }}>가입일시</th>
                                </tr>
                                </thead>
                                <tbody>
                                {stats.recentUsers?.map(u => (
                                    <tr key={u.id} style={s.tr}>
                                        <td style={{ ...s.td, fontWeight: 700 }}>{u.nickname}</td>
                                        <td style={s.td}>{u.email}</td>
                                        <td style={{ ...s.td, textAlign: 'center', fontSize: '12px' }}>
                                            {new Date(u.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div style={s.emptyState}>통계 데이터를 불러올 수 없습니다.</div>
            )}

            <div style={s.quickMenu}>
                <h3 style={s.sectionSubTitle}>🚀 빠른 관리 메뉴</h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button style={s.menuBtn} onClick={() => window.location.href = '/admin/users'}>유저 통합 관리</button>
                    <button style={s.menuBtn} onClick={() => window.location.href = '/admin/payments'}>결제 내역 조회</button>
                </div>
            </div>
        </div>
    );
};

// 스타일 객체는 그대로 유지 (생략 가능 시 생략)
const s: Record<string, React.CSSProperties> = {
    // ... 기존 스타일 유지 ...
    container: { padding: '40px', maxWidth: '1100px', margin: '0 auto' },
    header: { marginBottom: '40px' },
    title: { fontSize: '32px', fontWeight: 800, color: '#4C1D95' },
    meta: { color: '#6D28D9', fontSize: '16px', opacity: 0.9 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '40px' },
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '25px', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.05)', borderLeft: '6px solid #10B981', display: 'flex', flexDirection: 'column' },
    cardLabel: { fontSize: '14px', fontWeight: 700, color: '#6B7280', marginBottom: '8px' },
    cardValue: { fontSize: '26px', fontWeight: 900, color: '#1F2937' },
    cardSubText: { fontSize: '12px', color: '#9CA3AF', marginTop: '5px' },
    chartSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '40px' },
    chartBox: { backgroundColor: '#fff', padding: '25px', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.02)' },
    listSection: { backgroundColor: '#fff', padding: '30px', borderRadius: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', marginBottom: '40px' },
    sectionSubTitle: { fontSize: '18px', fontWeight: 800, color: '#5B21B6', marginBottom: '20px' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #F3F4F6', color: '#6B7280', fontSize: '13px' },
    td: { padding: '12px', borderBottom: '1px solid #F3F4F6', fontSize: '14px', color: '#374151' },
    tr: { transition: 'background 0.2s' },
    quickMenu: { marginTop: '20px' },
    menuBtn: { padding: '15px 25px', borderRadius: '15px', border: 'none', background: '#fff', color: '#7C3AED', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s' },
    emptyState: { textAlign: 'center', padding: '100px', color: '#94A3B8', fontSize: '18px' },
    noData: { textAlign: 'center', padding: '50px', color: '#ccc' }
};

export default AdminDashboard;