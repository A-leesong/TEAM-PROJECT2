import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    LineChart, Line
} from 'recharts';

interface PendingInquiry {
    id: string;
    email: string;
    category: string;
    title: string;
    content: string;
    createdAt: string;
}

// 📈 대시보드 데이터 타입
interface DashboardStats {
    totalUsers: number;
    todayNewUsers: number;
    totalSales: number;
    todaySales: number;
    suspendedUsers: number;
    activeUsers: number;
}

const CATEGORY_LABELS: Record<string, string> = {
    payment: '결제', account: '계정', bug: '버그', etc: '기타',
};

interface CategoryStat { name: string; count: number; }
interface DateStat { date: string; count: number; }

const AdminDashboard = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const role = useAuthStore((state) => state.role);
    const nickname = useAuthStore((state) => state.nickname);
    const accessToken = useAuthStore((state) => state.accessToken);
    const navigate = useNavigate();

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [pendingInquiries, setPendingInquiries] = useState<PendingInquiry[]>([]);
    const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
    const [artworkByDate, setArtworkByDate] = useState<DateStat[]>([]);
    const [replyMap, setReplyMap] = useState<Record<string, string>>({});
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<string | null>(null);

    // 🔄 통계 데이터 가져오기
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const token = useAuthStore.getState().accessToken; // 👈 스토어에서 직접 토큰 가져오기

            const res = await axios.get('/api/admin/dashboard/stats', {
                headers: {
                    Authorization: `Bearer ${token}` // 👈 헤더에 토큰 실어주기
                }
            });
            setStats(res.data);
        } catch (err) {
            console.error("통계 데이터 로딩 실패:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPendingInquiries = useCallback(async () => {
        try {
            const res = await axios.get('/api/admin/inquiries/pending?limit=5', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setPendingInquiries(res.data);
        } catch (e) {
            console.error('문의 로딩 실패', e);
        }
    }, [accessToken]);

    const handleReply = async (id: string) => {
        const reply = replyMap[id]?.trim();
        if (!reply) return;
        setSubmitting(id);
        try {
            await axios.post(`/api/admin/inquiries/${id}/reply`, { reply }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setPendingInquiries(prev => prev.filter(i => i.id !== id));
            setReplyMap(prev => { const n = { ...prev }; delete n[id]; return n; });
            setExpandedId(null);
        } catch {
            alert('답변 등록에 실패했습니다.');
        } finally {
            setSubmitting(null);
        }
    };

    const fetchChartData = useCallback(async () => {
        const headers = { Authorization: `Bearer ${accessToken}` };
        try {
            const [catRes, dateRes] = await Promise.all([
                axios.get('/api/admin/stats/inquiry-categories', { headers }),
                axios.get('/api/admin/stats/artwork-by-date', { headers }),
            ]);
            const catData: CategoryStat[] = Object.entries(catRes.data as Record<string, number>).map(
                ([key, count]) => ({ name: CATEGORY_LABELS[key] ?? key, count })
            );
            setCategoryStats(catData);
            setArtworkByDate(dateRes.data);
        } catch (e) {
            console.error('차트 데이터 로딩 실패', e);
        }
    }, [accessToken]);

    useEffect(() => {
        if (isAuthenticated && role === 'ADMIN') {
            fetchStats();
            fetchPendingInquiries();
            fetchChartData();
        }
    }, [isAuthenticated, role, fetchStats, fetchPendingInquiries, fetchChartData]);

    if (!isAuthenticated || role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={s.container}>
            <header style={s.header}>
                <h1 style={s.title}>📊 서비스 대시보드</h1>
                <p style={s.meta}>환영합니다, <strong>{nickname}</strong> 관리자님! 오늘의 현황입니다. 🐣</p>
            </header>

            {loading ? (
                <div style={s.emptyState}>데이터를 불러오는 중입니다... 🔄</div>
            ) : stats ? (
                <div style={s.grid}>
                    {/* 카드 1: 유저 현황 */}
                    <div style={s.card}>
                        <h3 style={s.cardLabel}>👥 전체 유저</h3>
                        <div style={s.cardValue}>{stats.totalUsers.toLocaleString()} 명</div>
                        <p style={s.cardSub}>오늘 신규: <span style={{color: '#10B981'}}>+{stats.todayNewUsers}</span></p>
                    </div>

                    {/* 카드 2: 매출 현황 */}
                    <div style={{...s.card, borderLeft: '6px solid #8B5CF6'}}>
                        <h3 style={s.cardLabel}>💰 누적 매출</h3>
                        <div style={{...s.cardValue, color: '#7C3AED'}}>₩ {stats.totalSales.toLocaleString()}</div>
                        <p style={s.cardSub}>오늘 매출: <span style={{fontWeight: 700}}>₩ {stats.todaySales.toLocaleString()}</span></p>
                    </div>

                    {/* 카드 3: 활성 상태 */}
                    <div style={s.card}>
                        <h3 style={s.cardLabel}>✅ 활성 유저</h3>
                        <div style={{...s.cardValue, color: '#10B981'}}>{stats.activeUsers.toLocaleString()} 명</div>
                        <p style={s.cardSub}>서비스 이용 중인 유저</p>
                    </div>

                    {/* 카드 4: 정지 상태 */}
                    <div style={{...s.card, borderLeft: '6px solid #EF4444'}}>
                        <h3 style={s.cardLabel}>🚫 정지 유저</h3>
                        <div style={{...s.cardValue, color: '#EF4444'}}>{stats.suspendedUsers.toLocaleString()} 명</div>
                        <p style={s.cardSub}>운영 정책 위반 등의 사유</p>
                    </div>
                </div>
            ) : (
                <div style={s.emptyState}>통계 데이터를 표시할 수 없습니다. 😥</div>
            )}

            {/* 📊 차트 섹션 */}
            <div style={s.chartGrid}>
                <div style={s.chartCard}>
                    <h3 style={s.chartTitle}>📂 문의 카테고리별 접수 현황</h3>
                    {categoryStats.length === 0 ? (
                        <div style={s.chartEmpty}>데이터 없음</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={categoryStats} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6B7280' }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <Tooltip formatter={(v) => [`${v}건`, '접수']} />
                                <Bar dataKey="count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div style={s.chartCard}>
                    <h3 style={s.chartTitle}>🎨 날짜별 이미지 생성 수 (최근 14일)</h3>
                    {artworkByDate.length === 0 ? (
                        <div style={s.chartEmpty}>데이터 없음</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={artworkByDate} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(d) => d.slice(5)} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <Tooltip formatter={(v) => [`${v}개`, '생성']} labelFormatter={(l) => `날짜: ${l}`} />
                                <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4, fill: '#7C3AED' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* 📬 응답 대기 문의 */}
            <div style={s.inquirySection}>
                <div style={s.inquirySectionHeader}>
                    <h3 style={s.sectionSubTitle}>📬 응답 대기 중
                        {pendingInquiries.length > 0 && (
                            <span style={s.pendingCount}>{pendingInquiries.length}</span>
                        )}
                    </h3>
                    <button style={s.goInquiryBtn} onClick={() => navigate('/admin/inquiries')}>
                        문의게시판 바로가기 →
                    </button>
                </div>

                {pendingInquiries.length === 0 ? (
                    <div style={s.inquiryEmpty}>미응답 문의가 없습니다.</div>
                ) : (
                    <div style={s.inquiryList}>
                        {pendingInquiries.map(item => (
                            <div key={item.id} style={s.inquiryCard}>
                                <div style={s.inquiryCardHeader} onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                                    <div style={s.inquiryMeta}>
                                        <span style={s.inquiryCategoryTag}>{CATEGORY_LABELS[item.category] ?? item.category}</span>
                                        <span style={s.inquiryTitle}>{item.title}</span>
                                    </div>
                                    <div style={s.inquiryRight}>
                                        <span style={s.inquiryEmail}>{item.email}</span>
                                        <span style={s.inquiryDate}>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
                                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{expandedId === item.id ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {expandedId === item.id && (
                                    <div style={s.inquiryExpanded}>
                                        <p style={s.inquiryContent}>{item.content}</p>
                                        <div style={s.replyForm}>
                                            <textarea
                                                style={s.textarea}
                                                placeholder="이메일로 발송할 답변 내용을 입력하세요..."
                                                value={replyMap[item.id] ?? ''}
                                                onChange={e => setReplyMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                rows={3}
                                            />
                                            <button
                                                style={{ ...s.submitBtn, opacity: submitting === item.id ? 0.6 : 1 }}
                                                onClick={() => handleReply(item.id)}
                                                disabled={submitting === item.id || !replyMap[item.id]?.trim()}
                                            >
                                                {submitting === item.id ? '발송 중...' : '이메일로 답변 발송'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 💡 바로가기 섹션 */}
            <div style={s.quickMenu}>
                <h3 style={s.sectionSubTitle}>🚀 빠른 관리 메뉴</h3>
                <div style={{display: 'flex', gap: '15px'}}>
                    <button style={s.menuBtn} onClick={() => window.location.href='/admin/users'}>통합 관리하기</button>
                    <button style={s.menuBtn} onClick={() => window.location.href='/admin/payments'}>결제 내역보기</button>
                </div>
            </div>
        </div>
    );
};

// 🌌 스타일 디자인
const s: Record<string, React.CSSProperties> = {
    container: { padding: '40px', maxWidth: '1100px', margin: '0 auto' },
    header: { marginBottom: '40px' },
    title: { fontSize: '32px', fontWeight: 800, color: '#4C1D95' },
    meta: { color: '#6D28D9', fontSize: '16px', opacity: 0.9 },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '25px',
        marginBottom: '50px'
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '30px',
        borderRadius: '25px',
        boxShadow: '0 10px 20px rgba(139, 92, 246, 0.1)',
        borderLeft: '6px solid #10B981', // 기본 초록색 포인트
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    cardLabel: { fontSize: '15px', fontWeight: 700, color: '#6B7280', marginBottom: '10px' },
    cardValue: { fontSize: '28px', fontWeight: 900, color: '#1F2937', marginBottom: '8px' },
    cardSub: { fontSize: '14px', color: '#9CA3AF' },
    inquirySection: { marginBottom: '40px' },
    inquirySectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    pendingCount: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#F59E0B', color: '#fff', fontSize: '11px', fontWeight: 800, borderRadius: '50%', width: '20px', height: '20px', marginLeft: '8px' },
    goInquiryBtn: { padding: '8px 18px', background: '#EDE9FE', color: '#7C3AED', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' },
    inquiryEmpty: { textAlign: 'center', padding: '32px', background: '#F9FAFB', borderRadius: '14px', color: '#9CA3AF', fontSize: '14px' },
    inquiryList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    inquiryCard: { background: '#fff', borderRadius: '12px', border: '1.5px solid #E5E7EB', borderLeft: '4px solid #F59E0B', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', overflow: 'hidden' },
    inquiryCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', cursor: 'pointer' },
    inquiryMeta: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
    inquiryCategoryTag: { background: '#FEF3C7', color: '#D97706', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' as const },
    inquiryTitle: { fontSize: '14px', fontWeight: 600, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
    inquiryRight: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 },
    inquiryEmail: { fontSize: '12px', color: '#9CA3AF' },
    inquiryDate: { fontSize: '12px', color: '#9CA3AF' },
    inquiryExpanded: { padding: '0 18px 16px', borderTop: '1px solid #F3F4F6' },
    inquiryContent: { fontSize: '13px', color: '#374151', lineHeight: 1.7, margin: '12px 0', padding: '12px', background: '#F9FAFB', borderRadius: '8px' },
    replyForm: { display: 'flex', flexDirection: 'column', gap: '8px' },
    textarea: { width: '100%', padding: '10px 12px', fontSize: '13px', border: '1.5px solid #E5E7EB', borderRadius: '10px', resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' },
    submitBtn: { alignSelf: 'flex-end', padding: '9px 22px', background: 'linear-gradient(135deg,#7C3AED,#6366F1)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' },
    chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '40px' },
    chartCard: { background: '#fff', borderRadius: '20px', padding: '24px 28px', boxShadow: '0 4px 16px rgba(139,92,246,0.08)', border: '1px solid #EDE9FE' },
    chartTitle: { fontSize: '15px', fontWeight: 700, color: '#5B21B6', marginBottom: '16px' },
    chartEmpty: { textAlign: 'center' as const, padding: '60px 0', color: '#D1D5DB', fontSize: '14px' },
    quickMenu: { marginTop: '48px' },
    sectionSubTitle: { fontSize: '20px', fontWeight: 800, color: '#5B21B6', marginBottom: '20px' },
    menuBtn: {
        padding: '15px 25px',
        borderRadius: '15px',
        border: 'none',
        background: '#fff',
        color: '#7C3AED',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        transition: 'all 0.2s'
    },
    emptyState: { textAlign: 'center', padding: '100px', color: '#94A3B8', fontSize: '18px' }
};

export default AdminDashboard;