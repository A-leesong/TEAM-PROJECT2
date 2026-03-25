import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { getAdminInquiries, submitInquiryAnswer } from '../../api/adminApi';

interface Inquiry {
    id: string;
    title: string;
    content: string;
    authorNickname: string;
    email: string;
    category: string;
    status: string;
    reply: string | null;
    createdAt: string;
}

const AdminInquiryManagement = () => {
    const { accessToken } = useAuthStore();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState('');
    
    // 페이징 및 검색 상태
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');

    const fetchInquiries = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const data = await getAdminInquiries(page, 10, statusFilter, searchKeyword);
            setInquiries(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error("문의 목록 로드 에러:", err);
        } finally {
            setLoading(false);
        }
    }, [accessToken, page, statusFilter, searchKeyword]);

    useEffect(() => {
        const timer = setTimeout(() => {
            void fetchInquiries();
        }, 300); // 디바운싱
        return () => clearTimeout(timer);
    }, [fetchInquiries]);

    const handleAnswerSubmit = async (id: string) => {
        if (!answerText.trim()) return;
        try {
            await submitInquiryAnswer(id, answerText);
            alert("답변이 등록되었습니다. ✨");
            setAnswerText('');
            setSelectedId(null);
            void fetchInquiries();
        } catch {
            alert("답변 등록에 실패했습니다.");
        }
    };

    return (
        <div style={s.container}>
            <header style={s.header}>
                <div style={s.headerLeft}>
                    <h1 style={s.title}>고객 문의 관리</h1>
                    <p style={s.subtitle}>사용자의 피드백에 귀를 기울이고 최상의 서포트를 제공하세요. 💬</p>
                </div>
                
                <div style={s.controls}>
                    <div style={s.searchBox}>
                        <span style={s.searchIcon}>🔍</span>
                        <input 
                            style={s.searchInput}
                            placeholder="제목 또는 내용 검색..."
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
                        <option value="pending">답변 대기</option>
                        <option value="replied">답변 완료</option>
                    </select>
                </div>
            </header>

            <div style={s.list}>
                {loading ? (
                    <div style={s.card}>
                        <p style={{ ...s.cardContent, textAlign: 'center', padding: '40px 0', margin: 0, fontWeight: 700, color: '#94A3B8' }}> ⏳ 문의 내역을 불러오고 있습니다...</p>
                    </div>
                ) : inquiries.length > 0 ? (
                    inquiries.map((iq) => (
                        <div key={iq.id} style={s.card}>
                            <div style={s.cardHeader}>
                                <div style={s.meta}>
                                    <span style={s.category}>[{iq.category}]</span>
                                    <span style={s.author}>{iq.authorNickname}</span>
                                    <span style={s.email}>({iq.email})</span>
                                    <span style={s.dot}>•</span>
                                    <span style={s.date}>{new Date(iq.createdAt).toLocaleString()}</span>
                                </div>
                                <span style={{...s.statusBadge, backgroundColor: iq.status === 'replied' ? '#D1FAE5' : '#FEF3C7', color: iq.status === 'replied' ? '#065F46' : '#92400E'}}>
                                    {iq.status === 'replied' ? '답변완료' : '답변대기'}
                                </span>
                            </div>
                            <h3 style={s.cardTitle}>{iq.title}</h3>
                            <p style={s.cardContent}>{iq.content}</p>

                            {iq.reply ? (
                                <div style={s.answerBox}>
                                    <div style={s.answerLabel}>공식 답변</div>
                                    <p style={s.answerText}>{iq.reply}</p>
                                </div>
                            ) : selectedId === iq.id ? (
                                <div style={s.replyForm}>
                                    <textarea 
                                        style={s.textarea} 
                                        placeholder="전문적이고 친절한 답변을 작성해주세요..."
                                        value={answerText}
                                        onChange={(e) => setAnswerText(e.target.value)}
                                    />
                                    <div style={s.formActions}>
                                        <button onClick={() => void handleAnswerSubmit(iq.id)} style={s.submitBtn}>답변 등록</button>
                                        <button onClick={() => setSelectedId(null)} style={s.cancelBtn}>취소</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setSelectedId(iq.id)} style={s.replyBtn}>답변 작성하기</button>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{ ...s.card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '80px', background: 'linear-gradient(to bottom, #FFF, #F8FAFC)' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '32px' }}>💬</span>
                        </div>
                        <h3 style={{ ...s.cardTitle, margin: 0, color: '#1E293B' }}>검색 결과가 없습니다.</h3>
                        <p style={{ ...s.cardContent, margin: 0, color: '#94A3B8', fontSize: '14px' }}>다른 검색어나 필터를 사용해 보세요.</p>
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

    list: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { 
        backgroundColor: '#FFF', borderRadius: '24px', padding: '30px', 
        border: '1px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    meta: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
    category: { fontSize: '12px', fontWeight: 900, color: '#6366F1' },
    author: { fontSize: '14px', fontWeight: 800, color: '#1E293B' },
    email: { fontSize: '12px', color: '#94A3B8', fontWeight: 500 },
    dot: { color: '#CBD5E1' },
    date: { fontSize: '13px', color: '#94A3B8', fontWeight: 500 },
    statusBadge: { padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800 },
    
    cardTitle: { fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: '0 0 10px 0' },
    cardContent: { fontSize: '15px', color: '#64748B', lineHeight: '1.6', margin: '0 0 20px 0' },

    answerBox: { backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #6366F1' },
    answerLabel: { fontSize: '10px', fontWeight: 900, color: '#6366F1', marginBottom: '8px', letterSpacing: '1px' },
    answerText: { fontSize: '14px', color: '#1E293B', margin: 0, lineHeight: '1.5' },

    replyBtn: { backgroundColor: '#0F172A', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' },
    replyForm: { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
    textarea: { width: '100%', height: '100px', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', resize: 'none' },
    formActions: { display: 'flex', gap: '10px' },
    submitBtn: { backgroundColor: '#6366F1', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' },
    cancelBtn: { backgroundColor: '#E2E8F0', color: '#64748B', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' },

    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '40px' },
    pageBtn: { backgroundColor: '#FFF', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#64748B' },
    pageNumbers: { display: 'flex', gap: '8px' },
    pageNumber: { width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }
};

export default AdminInquiryManagement;
