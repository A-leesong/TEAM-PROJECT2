import { useState, useEffect, useCallback } from 'react';
import { getAdminReportedArtworks, toggleArtworkVisibility } from '../../api/adminApi';

interface ReportedArtwork {
    id: string; // Report ID
    artworkId: string;
    artworkTitle: string;
    artworkImageUrl: string;
    authorNickname: string;
    reporterNickname: string;
    reason: string;
    description: string;
    status: string;
    createdAt: string;
}

const AdminArtworkManagement = () => {
    const [reports, setReports] = useState<ReportedArtwork[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // 페이징 및 검색 상태
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');

    const fetchReports = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getAdminReportedArtworks(page, 10, statusFilter, searchKeyword);
            setReports(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error("신고 내역 로드 에러:", err);
        } finally {
            setIsLoading(false);
        }
    }, [page, statusFilter, searchKeyword]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchReports();
        }, 300); // 디바운싱
        return () => clearTimeout(timer);
    }, [fetchReports]);

    const toggleVisibility = async (artworkId: string) => {
        if (!confirm(`이 작품의 노출 상태를 변경하시겠습니까?`)) return;

        try {
            await toggleArtworkVisibility(artworkId);
            alert("상태가 성공적으로 변경되었습니다.");
            void fetchReports();
        } catch {
            alert("상태 변경에 실패했습니다.");
        }
    };

    return (
        <div style={s.container}>
            <header style={s.header}>
                <div style={s.headerLeft}>
                    <h1 style={s.title}>작품 모더레이션</h1>
                    <p style={s.subtitle}>신고되거나 부적절한 콘텐츠를 관리하여 커뮤니티를 보호하세요. 🛡️</p>
                </div>

                <div style={s.controls}>
                    <div style={s.searchBox}>
                        <span style={s.searchIcon}>🔍</span>
                        <input 
                            style={s.searchInput}
                            placeholder="사유 또는 작품명 검색..."
                            value={searchKeyword}
                            onChange={(e) => {
                                setSearchKeyword(e.target.value);
                                setPage(0);
                            }}
                        />
                    </div>
                    <select 
                        style={s.select}
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="all">전체 상태</option>
                        <option value="pending">미처리 신고</option>
                        <option value="resolved">처리 완료</option>
                    </select>
                </div>
            </header>

            <div style={s.grid}>
                {isLoading ? (
                    <div style={{ ...s.card, gridColumn: '1 / -1', padding: '60px' }}>
                        <p style={{ ...s.placeholderText, textAlign: 'center', margin: 0, fontWeight: 700, color: '#94A3B8' }}> 🔍 신고된 작품을 정밀 스캔하고 있습니다...</p>
                    </div>
                ) : reports.length > 0 ? (
                    reports.map((report) => (
                        <div key={report.id} style={s.card}>
                            <div style={s.badgeRow}>
                                <span style={s.reportBadge}>⚠️ {report.reason}</span>
                                <span style={{...s.statusBadge, color: report.status === 'pending' ? '#F59E0B' : '#10B981'}}>
                                    {report.status === 'pending' ? '미처리' : '처리완료'}
                                </span>
                            </div>
                            <div style={s.imgBox}>
                                <img src={report.artworkImageUrl} alt={report.artworkTitle} style={s.img} />
                            </div>
                            <div style={s.info}>
                                <h3 style={s.artTitle}>{report.artworkTitle}</h3>
                                <p style={s.metaText}>작가: {report.authorNickname}</p>
                                <p style={s.metaText}>신고자: {report.reporterNickname}</p>
                                <div style={s.descBox}>
                                    <p style={s.description}>{report.description || "상세 설명 없음"}</p>
                                </div>
                                <div style={s.actions}>
                                    <button 
                                        onClick={() => void toggleVisibility(report.artworkId)} 
                                        style={s.actionBtn}
                                    >
                                        노출 상태 토글
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ ...s.card, gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '80px', background: 'linear-gradient(to bottom, #FFF, #F8FAFC)' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '32px' }}>🛡️</span>
                        </div>
                        <h3 style={{ ...s.artTitle, margin: 0, fontSize: '18px', color: '#1E293B' }}>검색 결과가 없습니다.</h3>
                        <p style={{ ...s.metaText, margin: 0, color: '#94A3B8' }}>다른 검색어나 필터를 사용해 보세요.</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div style={s.pagination}>
                    <button 
                        disabled={page === 0} 
                        onClick={() => setPage(p => p - 1)}
                        style={{...s.pageBtn, opacity: page === 0 ? 0.5 : 1}}
                    >이전</button>
                    <div style={s.pageNumbers}>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button 
                                key={i}
                                onClick={() => setPage(i)}
                                style={{...s.pageNumber, backgroundColor: page === i ? '#6366F1' : 'transparent', color: page === i ? '#FFF' : '#64748B'}}
                            >{i + 1}</button>
                        ))}
                    </div>
                    <button 
                        disabled={page === totalPages - 1} 
                        onClick={() => setPage(p => p + 1)}
                        style={{...s.pageBtn, opacity: page === totalPages - 1 ? 0.5 : 1}}
                    >다음</button>
                </div>
            )}
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    container: { padding: '20px 0' },
    header: { marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' },
    headerLeft: { flex: 1, minWidth: '300px' },
    title: { fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0 },
    subtitle: { fontSize: '15px', color: '#64748B', fontWeight: 500, marginTop: '4px' },
    
    controls: { display: 'flex', gap: '12px', alignItems: 'center' },
    searchBox: { position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: '15px', fontSize: '14px', color: '#94A3B8' },
    searchInput: { 
        padding: '12px 15px 12px 40px', borderRadius: '12px', border: '1px solid #E2E8F0', 
        fontSize: '14px', width: '250px', outline: 'none', transition: 'all 0.2s',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    },
    select: { 
        padding: '12px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', 
        fontSize: '14px', outline: 'none', backgroundColor: '#FFF', cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
    card: { 
        backgroundColor: '#FFF', borderRadius: '24px', overflow: 'hidden', 
        border: '1px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
    },
    badgeRow: { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFCFE' },
    reportBadge: { fontSize: '11px', fontWeight: 900, color: '#F59E0B' },
    statusBadge: { fontSize: '11px', fontWeight: 900 },
    imgBox: { height: '200px', backgroundColor: '#F8FAFC' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    info: { padding: '20px' },
    artTitle: { fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 8px 0' },
    metaText: { fontSize: '13px', color: '#64748B', margin: '0 0 4px 0', fontWeight: 500 },
    descBox: { backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', margin: '12px 0' },
    description: { fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.4' },
    actions: { display: 'flex', gap: '10px', marginTop: '15px' },
    actionBtn: { 
        flex: 1, padding: '12px', border: 'none', borderRadius: '12px', 
        backgroundColor: '#0F172A', color: '#FFF', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: '0.2s'
    },
    placeholderText: { fontSize: '14px', color: '#94A3B8' },

    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '40px' },
    pageBtn: { backgroundColor: '#FFF', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#64748B' },
    pageNumbers: { display: 'flex', gap: '8px' },
    pageNumber: { width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }
};

export default AdminArtworkManagement;