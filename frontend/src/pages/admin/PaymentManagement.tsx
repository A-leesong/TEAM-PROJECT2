import { useState, useEffect } from 'react';
import { getAdminPayments } from '../../api/adminApi';

interface PaymentRecord {
    id: string;
    nickname: string;
    userEmail: string;
    amount: number;
    tokenCount: number;
    payMethod: string;
    createdAt: string;
}

const PaymentManagement = () => {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [stats, setStats] = useState({ totalRevenue: 0, todayRevenue: 0, totalCount: 0 });

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await getAdminPayments(page, 10, keyword);
            setPayments(data.content || []);
            setTotalPages(data.totalPages || 0);
            
            // Note: In a real app, global stats should come from a dedicated stats API
            // Here we use the totalElements from the paged response for 'totalCount'
            setStats(prev => ({
                ...prev,
                totalCount: data.totalElements || 0,
                totalRevenue: (data.totalElements || 0) * 10000 // Approximate for UI
            }));
        } catch (err) {
            console.error("결제 내역 로드 에러:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchPayments();
    }, [page]);

    const handleSearch = () => {
        setPage(0);
        void fetchPayments();
    };

    return (
        <div style={s.container}>
            <header style={s.header}>
                <h1 style={s.title}>수익 관리 및 트래킹</h1>
                <p style={s.subtitle}>토큰 판매 현황과 재무 성과를 실시간으로 모니터링하세요. 💰</p>
            </header>

            {/* 📊 주요 통계 */}
            <div style={s.statsRow}>
                <div style={s.statCard}>
                    <div style={s.statLabel}>누적 총 매출액 (추정)</div>
                    <div style={s.statValue}>₩ {(stats.totalRevenue || 0).toLocaleString()}</div>
                </div>
                <div style={s.statCard}>
                    <div style={s.statLabel}>오늘의 판매액</div>
                    <div style={s.statValue}>₩ {(stats.todayRevenue || 0).toLocaleString()}</div>
                </div>
                <div style={s.statCard}>
                    <div style={s.statLabel}>총 거래 횟수</div>
                    <div style={s.statValue}>{stats.totalCount} 건</div>
                </div>
            </div>

            <div style={s.filterRow}>
                <div style={s.searchBox}>
                    <input 
                        type="text" 
                        placeholder="구매자 닉네임 또는 이메일 검색..." 
                        style={s.searchInput}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} style={s.searchBtn}>검색</button>
                    {keyword && (
                        <button 
                            onClick={() => { setKeyword(''); setPage(0); setTimeout(() => void fetchPayments(), 0); }} 
                            style={s.resetBtn}
                        >초기화</button>
                    )}
                </div>
            </div>

            <div style={s.tableCard}>
                <table style={s.table}>
                    <thead>
                        <tr>
                            <th style={s.th}>결제 일시</th>
                            <th style={s.th}>사용자</th>
                            <th style={s.th}>이메일</th>
                            <th style={s.th}>구매 토큰</th>
                            <th style={{...s.th, textAlign: 'right'}}>결제 금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={s.emptyTd}>장부를 불러오는 중입니다...</td></tr>
                        ) : payments.length > 0 ? (
                            payments.map((p) => (
                                <tr key={p.id} style={s.tr}>
                                    <td style={s.td}>{new Date(p.createdAt).toLocaleString()}</td>
                                    <td style={{...s.td, fontWeight: 700, color: '#1E293B'}}>{p.nickname}</td>
                                    <td style={s.td}>{p.userEmail}</td>
                                    <td style={{...s.td, fontWeight: 800, color: '#6366F1'}}>+ {p.tokenCount} 🪙</td>
                                    <td style={{...s.td, textAlign: 'right', fontWeight: 900, color: '#0F172A'}}>
                                        ₩{(p.amount || 0).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} style={s.emptyTd}>조회된 결제 내역이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>

                {/* 🔢 Pagination */}
                {totalPages > 1 && (
                    <div style={s.pagination}>
                        <button 
                            disabled={page === 0} 
                            onClick={() => setPage(p => p - 1)}
                            style={{...s.pageBtn, opacity: page === 0 ? 0.3 : 1}}
                        >이전</button>
                        <span style={s.pageInfo}>{page + 1} / {totalPages}</span>
                        <button 
                            disabled={page >= totalPages - 1} 
                            onClick={() => setPage(p => p + 1)}
                            style={{...s.pageBtn, opacity: page >= totalPages - 1 ? 0.3 : 1}}
                        >다음</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    container: { padding: '20px 0' },
    header: { marginBottom: '40px' },
    title: { fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0 },
    subtitle: { fontSize: '15px', color: '#64748B', fontWeight: 500, marginTop: '4px' },

    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' },
    statCard: { 
        backgroundColor: '#FFF', padding: '25px', borderRadius: '24px', 
        border: '1px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
    },
    statLabel: { fontSize: '11px', fontWeight: 900, color: '#94A3B8', letterSpacing: '1px', marginBottom: '10px' },
    statValue: { fontSize: '24px', fontWeight: 900, color: '#1E293B' },

    filterRow: { marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' },
    searchBox: { display: 'flex', gap: '8px' },
    searchInput: { 
        padding: '10px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', 
        fontSize: '13px', width: '260px' 
    },
    searchBtn: { 
        padding: '10px 20px', backgroundColor: '#1E293B', color: '#FFF', 
        borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' 
    },
    resetBtn: { 
        padding: '10px 16px', backgroundColor: '#F1F5F9', color: '#64748B', 
        borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' 
    },

    tableCard: { backgroundColor: '#FFF', borderRadius: '24px', overflow: 'hidden', border: '1px solid #F1F5F9' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '18px 24px', backgroundColor: '#FAFCFE', color: '#94A3B8', fontSize: '11px', fontWeight: 900, letterSpacing: '0.5px', borderBottom: '1px solid #F1F5F9' },
    td: { padding: '20px 24px', borderBottom: '1px solid #F8FAFC', fontSize: '14px', color: '#64748B' },
    tr: { transition: 'background 0.2s' },
    emptyTd: { textAlign: 'center', padding: '100px', color: '#94A3B8', fontWeight: 600 },

    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '24px', borderTop: '1px solid #F8FAFC' },
    pageBtn: { padding: '8px 16px', backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' },
    pageInfo: { fontSize: '13px', fontWeight: 700, color: '#1E293B' }
};

export default PaymentManagement;