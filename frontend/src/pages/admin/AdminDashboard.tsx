import { useState, useEffect, useCallback } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { getAdminDashboardStats, getAdminWeeklyStats, type WeeklyStat, type ArtworkStat } from '../../api/adminApi';
import { useAuthStore } from '../../stores/useAuthStore';

const AdminDashboard = () => {
    const { accessToken } = useAuthStore();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeArtworks: 0,
        pendingInquiries: 0,
        todaySales: 0,
        topArtworks: [] as ArtworkStat[]
    });
    const [weeklyData, setWeeklyData] = useState<WeeklyStat[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const [statsData, weekly] = await Promise.all([
                getAdminDashboardStats(),
                getAdminWeeklyStats()
            ]);
            setStats(statsData);
            setWeeklyData(weekly || []);
        } catch (error) {
            console.error("Dashboard data error:", error);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        void fetchDashboardData();
    }, [fetchDashboardData]);

    const statCards = [
        { title: '총 사용자', value: (stats?.totalUsers || 0).toLocaleString(), icon: '👤', color: '#6366F1' },
        { title: '활성 작품', value: (stats?.activeArtworks || 0).toLocaleString(), icon: '🎨', color: '#8B5CF6' },
        { title: '대기 문의', value: (stats?.pendingInquiries || 0).toLocaleString(), icon: '📬', color: '#EC4899' },
        { title: '오늘 매출', value: `₩${(stats?.todaySales || 0).toLocaleString()}`, icon: '💰', color: '#10B981' },
    ];

    return (
        <div style={s.container}>
            <header style={s.header}>
                <div>
                    <h1 style={s.title}>오버뷰</h1>
                    <p style={s.subtitle}>다시 오신 것을 환영합니다. 오늘의 현황입니다. ⚡</p>
                </div>
                <button onClick={() => void fetchDashboardData()} style={s.refreshBtn}>
                    <span style={{ marginRight: 6 }}>🔄</span> {loading ? '동기화 중...' : '데이터 새로고침'}
                </button>
            </header>

            {/* 🚀 Giant Stat Cards */}
            <div style={s.grid}>
                {statCards.map((card, idx) => (
                    <div key={idx} style={s.card}>
                        <div style={s.cardTop}>
                            <span style={s.cardIcon}>{card.icon}</span>
                            <span style={s.cardLabel}>{card.title}</span>
                        </div>
                        <div style={s.cardValue}>{card.value}</div>
                        <div style={{...s.cardTrend, color: card.color}}>
                            <span style={{ opacity: 0.8 }}>PREV:</span>
                            <span style={s.trendLabel}>N/A</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 📊 Slick Monochromatic Charts */}
            <div style={s.chartSection}>
                <div style={s.chartCard}>
                    <div style={s.chartHeader}>
                        <h3 style={s.chartTitle}>사용자 증가 추이</h3>
                        <p style={s.chartSubtitle}>주간 방문자 및 신규 가입자 현황</p>
                    </div>
                    <div style={s.chartBody}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94A3B8', fontSize: 12}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94A3B8', fontSize: 12}}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#6366F1" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={s.chartCard}>
                    <div style={s.chartHeader}>
                        <h3 style={s.chartTitle}>수익 스트림</h3>
                        <p style={s.chartSubtitle}>일별 토큰 구매 트렌드</p>
                    </div>
                    <div style={s.chartBody}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94A3B8', fontSize: 12}}
                                    dy={10}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Line 
                                    type="stepAfter" 
                                    dataKey="value" 
                                    stroke="#8B5CF6" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#FFF' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{ ...s.chartSection, marginTop: '24px', gridTemplateColumns: '1fr' }}>
                {/* 🏆 Trending Artworks */}
                <div style={s.chartCard}>
                    <div style={s.chartHeader}>
                        <h3 style={s.chartTitle}>실시간 인기 작품 TOP 5</h3>
                        <p style={s.chartSubtitle}>가장 많은 좋아요를 받은 작품들입니다.</p>
                    </div>
                    <div style={{ padding: '0 10px' }}>
                        {stats.topArtworks?.length > 0 ? (
                            stats.topArtworks.map((art, i) => (
                                <div key={art.artworkId} style={s.productRow}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ 
                                            ...s.rankBadge, 
                                            backgroundColor: i < 3 ? '#6366F1' : '#F1F5F9', 
                                            color: i < 3 ? '#FFF' : '#94A3B8' 
                                        }}>{i + 1}</div>
                                        <div style={s.artThumbBox}>
                                            <img src={art.imageUrl} alt={art.title} style={s.artThumb} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: 14, fontWeight: 800, color: '#1E293B' }}>{art.title}</span>
                                            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>by {art.author}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 14 }}>❤️</span>
                                        <span style={{ fontSize: 15, fontWeight: 900, color: '#6366F1' }}>{art.likeCount}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={s.emptyStateMini}>
                                <span style={{ fontSize: 20, opacity: 0.15, marginBottom: 4 }}>🎨</span>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#CBD5E1', margin: 0 }}>데이터 없음</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    container: { animation: 'fadeIn 0.5s ease-out' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' },
    title: { fontSize: '32px', fontWeight: 900, color: '#1E293B', margin: 0, letterSpacing: '-1px' },
    subtitle: { fontSize: '15px', color: '#64748B', fontWeight: 500, marginTop: '4px' },
    refreshBtn: { 
        padding: '10px 20px', backgroundColor: '#FFF', border: '1px solid #E2E8F0', 
        borderRadius: '12px', color: '#1E293B', fontWeight: 700, fontSize: '13px', 
        cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: '0.2s' 
    },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' },
    card: { 
        backgroundColor: '#FFF', padding: '30px', borderRadius: '24px', 
        border: '1px solid #F1F5F9', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease'
    },
    cardTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
    cardIcon: { fontSize: '20px' },
    cardLabel: { fontSize: '14px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' },
    cardValue: { fontSize: '36px', fontWeight: 900, color: '#0F172A', marginBottom: '10px', letterSpacing: '-1px' },
    cardTrend: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800 },
    trendLabel: { color: '#94A3B8', fontWeight: 500 },

    chartSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    chartCard: { 
        backgroundColor: '#FFF', padding: '30px', borderRadius: '30px', 
        border: '1px solid #F1F5F9', boxShadow: '0 10px 40px -15px rgba(0,0,0,0.05)' 
    },
    chartHeader: { marginBottom: '30px' },
    chartTitle: { fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: 0 },
    chartSubtitle: { fontSize: '13px', color: '#94A3B8', marginTop: '4px' },
    chartBody: { width: '100%', height: '300px' },

    productRow: { 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '16px 0', borderBottom: '1px solid #F1F5F9' 
    },
    rankBadge: { 
        width: 24, height: 24, borderRadius: 6, display: 'flex', 
        alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 
    },
    artThumbBox: { width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#F1F5F9' },
    artThumb: { width: '100%', height: '100%', objectFit: 'cover' },

    emptyStateMini: { 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', padding: '30px 0',
        backgroundColor: 'transparent'
    }
};

export default AdminDashboard;