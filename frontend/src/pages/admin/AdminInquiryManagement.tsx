import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MessageSquare, X } from 'lucide-react';
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

const PAGE_SIZE = 10;

const AdminInquiryManagement = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [answerText, setAnswerText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminInquiries(page, PAGE_SIZE, statusFilter, searchKeyword);
            setInquiries(data.content || []);
            setTotal(data.totalElements || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, searchKeyword]);

    useEffect(() => { void fetchInquiries(); }, [fetchInquiries]);
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

    const handleSearch = () => { setSearchKeyword(searchInput); setPage(0); };
    const handleFilterChange = (val: string) => { setStatusFilter(val); setPage(0); };

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const openModal = (iq: Inquiry) => { setSelectedInquiry(iq); setAnswerText(''); };
    const closeModal = () => { setSelectedInquiry(null); setAnswerText(''); };

    const handleSubmit = async () => {
        if (!selectedInquiry || !answerText.trim() || submitting) return;
        setSubmitting(true);
        try {
            await submitInquiryAnswer(selectedInquiry.id, answerText);
            closeModal();
            void fetchInquiries();
        } catch {
            alert('답변 등록에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <style>{`
                .iq-row { transition: background 0.15s; cursor: pointer; }
                .iq-row:hover { background: #f8fafc !important; }
                .iq-page-btn:hover:not(:disabled) { background: #f1f5f9 !important; }
                .iq-filter-btn:hover { background: #f1f5f9 !important; }
                @keyframes iqModalIn { from{opacity:0;transform:translateY(12px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
            `}</style>

            {/* 툴바 */}
            <div style={s.toolbar}>
                <div style={s.searchWrap}>
                    <Search size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <input
                        style={s.searchInput}
                        placeholder="제목 또는 작성자 검색"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button style={s.searchBtn} onClick={handleSearch}>검색</button>
                <div style={s.filterGroup}>
                    {(['all', 'pending', 'replied'] as const).map(v => (
                        <button key={v} className="iq-filter-btn"
                            style={{ ...s.filterBtn, ...(statusFilter === v ? s.filterActive : {}) }}
                            onClick={() => handleFilterChange(v)}>
                            {v === 'all' ? '전체' : v === 'pending' ? '답변 대기' : '답변 완료'}
                        </button>
                    ))}
                </div>
                <span style={s.totalBadge}>총 {total.toLocaleString()}개</span>
            </div>

            {/* 테이블 */}
            <div style={{ ...s.tableWrap, opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                <table style={s.table}>
                    <thead>
                        <tr style={s.thead}>
                            {['카테고리', '제목', '작성자', '등록일', '상태'].map(h => (
                                <th key={h} style={{ ...s.th, textAlign: h === '상태' ? 'center' : 'left' as any }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && inquiries.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={s.empty}>
                                    <MessageSquare size={28} color="#cbd5e1" style={{ marginBottom: 8 }} />
                                    <div>문의 내역이 없습니다</div>
                                </td>
                            </tr>
                        ) : inquiries.map(iq => (
                            <tr key={iq.id} className="iq-row" style={s.tr} onClick={() => openModal(iq)}>
                                <td style={s.td}><span style={s.categoryBadge}>{iq.category}</span></td>
                                <td style={{ ...s.td, maxWidth: 320 }}><span style={s.titleText}>{iq.title}</span></td>
                                <td style={s.td}>
                                    <div style={s.authorWrap}>
                                        <span style={s.authorName}>{iq.authorNickname}</span>
                                        <span style={s.authorEmail}>{iq.email}</span>
                                    </div>
                                </td>
                                <td style={s.td}>
                                    <span style={s.date}>
                                        {new Date(iq.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                    </span>
                                </td>
                                <td style={{ ...s.td, textAlign: 'center' }}>
                                    <span style={{ ...s.statusBadge, ...(iq.status === 'replied' ? s.statusDone : s.statusPending) }}>
                                        {iq.status === 'replied' ? '답변완료' : '답변대기'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div style={s.pagination}>
                    <button className="iq-page-btn" style={s.pageBtn} onClick={() => setPage(0)} disabled={page === 0}><ChevronsLeft size={15} /></button>
                    <button className="iq-page-btn" style={s.pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft size={15} /></button>
                    {Array.from({ length: totalPages }, (_, i) => i)
                        .slice(Math.max(0, page - 2), Math.min(totalPages, page + 3))
                        .map(i => (
                            <button key={i} className="iq-page-btn"
                                style={{ ...s.pageBtn, ...(i === page ? s.pageActive : {}) }}
                                onClick={() => setPage(i)}>{i + 1}</button>
                        ))}
                    <button className="iq-page-btn" style={s.pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}><ChevronRight size={15} /></button>
                    <button className="iq-page-btn" style={s.pageBtn} onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1}><ChevronsRight size={15} /></button>
                </div>
            )}

            {/* 모달 */}
            {selectedInquiry && createPortal(
                <div style={s.overlay} onClick={closeModal}>
                    <div style={s.modal} onClick={e => e.stopPropagation()}>
                        {/* 모달 헤더 */}
                        <div style={s.modalHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={s.categoryBadge}>{selectedInquiry.category}</span>
                                <span style={{ ...s.statusBadge, ...(selectedInquiry.status === 'replied' ? s.statusDone : s.statusPending) }}>
                                    {selectedInquiry.status === 'replied' ? '답변완료' : '답변대기'}
                                </span>
                            </div>
                            <button style={s.closeBtn} onClick={closeModal}><X size={16} /></button>
                        </div>

                        <h3 style={s.modalTitle}>{selectedInquiry.title}</h3>
                        <div style={s.modalMeta}>
                            <span style={s.authorName}>{selectedInquiry.authorNickname}</span>
                            <span style={s.authorEmail}>{selectedInquiry.email}</span>
                            <span style={{ color: '#cbd5e1' }}>·</span>
                            <span style={s.date}>{new Date(selectedInquiry.createdAt).toLocaleString('ko-KR')}</span>
                        </div>

                        <div style={s.divider} />

                        {/* 문의 내용 */}
                        <div style={s.contentBox}>
                            <p style={s.contentLabel}>문의 내용</p>
                            <p style={s.contentText}>{selectedInquiry.content}</p>
                        </div>

                        {/* 답변 */}
                        {selectedInquiry.reply ? (
                            <div style={s.replyBox}>
                                <p style={s.replyLabel}>공식 답변</p>
                                <p style={s.replyText}>{selectedInquiry.reply}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <p style={s.replyLabel}>답변 작성</p>
                                <textarea
                                    style={s.textarea}
                                    placeholder="답변을 작성해주세요..."
                                    value={answerText}
                                    onChange={e => setAnswerText(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    <button style={s.cancelBtn} onClick={closeModal}>취소</button>
                                    <button style={{ ...s.submitBtn, opacity: submitting ? 0.6 : 1 }}
                                        onClick={() => void handleSubmit()} disabled={submitting}>
                                        답변 등록
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    toolbar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
    searchWrap: {
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
        padding: '8px 14px', flex: 1, maxWidth: 360,
    },
    searchInput: { border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', width: '100%' },
    searchBtn: { padding: '8px 18px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
    filterGroup: { display: 'flex', gap: 6 },
    filterBtn: { padding: '8px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer', transition: 'all 0.15s' },
    filterActive: { background: '#1e3a5f', color: '#fff', border: '1px solid #1e3a5f' },
    totalBadge: { marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#94a3b8' },

    tableWrap: { background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { borderBottom: '1px solid #f1f5f9', background: '#f8fafc' },
    th: { padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.3 },
    tr: { borderBottom: '1px solid #f8fafc' },
    td: { padding: '14px 16px', verticalAlign: 'middle' },

    categoryBadge: { fontSize: 10, fontWeight: 800, color: '#6366f1', background: '#eef2ff', padding: '3px 8px', borderRadius: 6 },
    titleText: { fontSize: 13, fontWeight: 700, color: '#1e293b' },
    authorWrap: { display: 'flex', flexDirection: 'column', gap: 2 },
    authorName: { fontSize: 12, fontWeight: 700, color: '#374151' },
    authorEmail: { fontSize: 11, color: '#94a3b8' },
    date: { fontSize: 12, color: '#94a3b8' },
    statusBadge: { fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6 },
    statusDone: { color: '#10b981', background: '#f0fdf4' },
    statusPending: { color: '#f59e0b', background: '#fffbeb' },

    empty: { textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 13, fontWeight: 600 },

    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 },
    pageBtn: { width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' },
    pageActive: { background: '#1e3a5f', color: '#fff', border: '1px solid #1e3a5f' },

    overlay: { position: 'fixed', inset: 0, background: 'rgba(15,32,56,0.35)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
    modal: { background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, padding: '28px 32px', boxShadow: '0 24px 60px rgba(0,0,0,0.18)', animation: 'iqModalIn 0.22s ease', maxHeight: '85vh', overflowY: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    modalTitle: { margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: '#1e293b' },
    modalMeta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
    closeBtn: { background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', padding: '5px 7px', display: 'inline-flex', alignItems: 'center' },
    divider: { height: 1, background: '#f1f5f9', margin: '16px 0' },

    contentBox: { background: '#f8fafc', borderRadius: 12, padding: '16px 18px', marginBottom: 16 },
    contentLabel: { margin: '0 0 8px', fontSize: 10, fontWeight: 900, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase' as const },
    contentText: { margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' },
    replyBox: { background: '#f0fdf4', borderRadius: 12, padding: '16px 18px', borderLeft: '3px solid #10b981' },
    replyLabel: { margin: '0 0 8px', fontSize: 10, fontWeight: 900, color: '#6366f1', letterSpacing: 1.5, textTransform: 'uppercase' as const },
    replyText: { margin: 0, fontSize: 13, color: '#1e293b', lineHeight: 1.8, whiteSpace: 'pre-wrap' },
    textarea: { width: '100%', height: 120, padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'none', color: '#1e293b', background: '#fff', boxSizing: 'border-box' },
    submitBtn: { padding: '8px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    cancelBtn: { padding: '8px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
};

export default AdminInquiryManagement;
