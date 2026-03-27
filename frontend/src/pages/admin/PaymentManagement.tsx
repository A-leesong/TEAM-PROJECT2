import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CreditCard, X, Ticket, CalendarDays } from 'lucide-react';
import { getAdminPayments, getAdminDashboardStats, getPaymentStats } from '../../api/adminApi';

interface PaymentRecord {
    id: string;
    nickname: string;
    userEmail: string;
    amount: number;
    tokenCount: number;
    payMethod: string;
    createdAt: string;
}

const PAGE_SIZE = 10;

const PAY_METHOD_LABEL: Record<string, string> = {
    CARD: '카드',
    KAKAO: '카카오페이',
    TOSS: '토스',
    VIRTUAL: '가상계좌',
};

const PaymentManagement = () => {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selected, setSelected] = useState<PaymentRecord | null>(null);
    const fromPickerRef = useRef<HTMLInputElement>(null);
    const toPickerRef = useRef<HTMLInputElement>(null);
    const [totalSales, setTotalSales] = useState(0);
    const [todaySales, setTodaySales] = useState(0);
    const [periodSales, setPeriodSales] = useState<number | null>(null);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminPayments(page, PAGE_SIZE, searchKeyword, fromDate, toDate);
            setPayments(data.content || []);
            setTotal(data.totalElements || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, searchKeyword, fromDate, toDate]);

    useEffect(() => { void fetchPayments(); }, [fetchPayments]);
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);
    useEffect(() => {
        getAdminDashboardStats().then(data => {
            setTotalSales(data.totalSales ?? 0);
            setTodaySales(data.todaySales ?? 0);
        }).catch(console.error);
    }, []);

    const handleDateInput = (value: string, setter: (v: string) => void) => {
        const digits = value.replace(/\D/g, '').slice(0, 8);
        let formatted = digits;
        if (digits.length > 4) formatted = digits.slice(0, 4) + '-' + digits.slice(4);
        if (digits.length > 6) formatted = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);
        setter(formatted);
    };

    const handleSearch = () => {
        setSearchKeyword(searchInput);
        setPage(0);
        if (fromDate && toDate) {
            getPaymentStats(fromDate, toDate).then(d => setPeriodSales(d.total)).catch(console.error);
        } else {
            setPeriodSales(null);
        }
    };

    return (
        <div>
            <style>{`
                .pm-row { transition: background 0.15s; cursor: pointer; }
                .pm-row:hover { background: #f8fafc !important; }
                .pm-page-btn:hover:not(:disabled) { background: #f1f5f9 !important; }
                @keyframes pmModalIn { from{opacity:0;transform:translateY(12px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
                .pm-date-input::placeholder { color: #cbd5e1; }
            `}</style>

            {/* 통계 카드 */}
            <div style={{ ...s.statsRow, gridTemplateColumns: periodSales !== null ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)' }}>
                {[
                    { label: '총 거래 건수', value: `${total.toLocaleString()} 건` },
                    { label: '총 매출', value: `₩ ${totalSales.toLocaleString()}` },
                    { label: '일일 매출', value: `₩ ${todaySales.toLocaleString()}` },
                    ...(periodSales !== null ? [{ label: `조회 기간 매출 (${fromDate} ~ ${toDate})`, value: `₩ ${periodSales.toLocaleString()}` }] : []),
                ].map(({ label, value }) => (
                    <div key={label} style={s.statCard}>
                        <p style={s.statLabel}>{label}</p>
                        <p style={s.statValue}>{value}</p>
                    </div>
                ))}
            </div>

            {/* 툴바 */}
            <div style={s.toolbar}>
                <div style={s.searchWrap}>
                    <Search size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <input
                        style={s.searchInput}
                        placeholder="닉네임 또는 이메일 검색"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <div style={s.dateWrap}>
                    <input
                        type="text"
                        value={fromDate}
                        onChange={e => handleDateInput(e.target.value, setFromDate)}
                        placeholder="YYYY-MM-DD"
                        maxLength={10}
                        className="pm-date-input" style={s.dateInput}
                    />
                    <input ref={fromPickerRef} type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} />
                    <button onClick={() => fromPickerRef.current?.showPicker()} style={s.calBtn}>
                        <CalendarDays size={14} color="#94a3b8" />
                    </button>
                </div>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>~</span>
                <div style={s.dateWrap}>
                    <input
                        type="text"
                        value={toDate}
                        onChange={e => handleDateInput(e.target.value, setToDate)}
                        placeholder="YYYY-MM-DD"
                        maxLength={10}
                        className="pm-date-input" style={s.dateInput}
                    />
                    <input ref={toPickerRef} type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} />
                    <button onClick={() => toPickerRef.current?.showPicker()} style={s.calBtn}>
                        <CalendarDays size={14} color="#94a3b8" />
                    </button>
                </div>
                <button style={s.searchBtn} onClick={handleSearch}>검색</button>
                {(fromDate || toDate || searchKeyword) && (
                    <button
                        style={s.resetBtn}
                        onClick={() => {
                            setSearchInput(''); setSearchKeyword('');
                            setFromDate(''); setToDate('');
                            setPeriodSales(null); setPage(0);
                        }}
                    >초기화</button>
                )}
                <span style={s.totalBadge}>총 {total.toLocaleString()}건</span>
            </div>

            {/* 테이블 */}
            <div style={{ ...s.tableWrap, opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                <table style={s.table}>
                    <thead>
                        <tr style={s.thead}>
                            {['결제 일시', '사용자', '이메일', '결제 수단', '구매 토큰', '결제 금액'].map(h => (
                                <th key={h} style={{ ...s.th, textAlign: h === '결제 금액' ? 'right' : 'left' as React.CSSProperties['textAlign'] }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && payments.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={s.empty}>
                                    <CreditCard size={28} color="#cbd5e1" style={{ marginBottom: 8 }} />
                                    <div>결제 내역이 없습니다</div>
                                </td>
                            </tr>
                        ) : payments.map(p => (
                            <tr key={p.id} className="pm-row" style={s.tr} onClick={() => setSelected(p)}>
                                <td style={s.td}>
                                    <span style={s.date}>
                                        {new Date(p.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </td>
                                <td style={s.td}>
                                    <span style={s.nickname}>{p.nickname}</span>
                                </td>
                                <td style={s.td}>
                                    <span style={s.email}>{p.userEmail}</span>
                                </td>
                                <td style={s.td}>
                                    <span style={s.methodBadge}>
                                        {PAY_METHOD_LABEL[p.payMethod] ?? p.payMethod ?? '-'}
                                    </span>
                                </td>
                                <td style={s.td}>
                                    <span style={s.tokenCount}><Ticket size={16} strokeWidth={2.8} style={{ marginRight: 6, verticalAlign: 'middle' }} />+{p.tokenCount}</span>
                                </td>
                                <td style={{ ...s.td, textAlign: 'right' }}>
                                    <span style={s.amount}>₩{(p.amount || 0).toLocaleString()}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div style={s.pagination}>
                    <button className="pm-page-btn" style={s.pageBtn} onClick={() => setPage(0)} disabled={page === 0}>
                        <ChevronsLeft size={15} />
                    </button>
                    <button className="pm-page-btn" style={s.pageBtn} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                        <ChevronLeft size={15} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i)
                        .slice(Math.max(0, page - 2), Math.min(totalPages, page + 3))
                        .map(i => (
                            <button
                                key={i}
                                className="pm-page-btn"
                                style={{ ...s.pageBtn, ...(i === page ? s.pageActive : {}) }}
                                onClick={() => setPage(i)}
                            >{i + 1}</button>
                        ))
                    }
                    <button className="pm-page-btn" style={s.pageBtn} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                        <ChevronRight size={15} />
                    </button>
                    <button className="pm-page-btn" style={s.pageBtn} onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>
                        <ChevronsRight size={15} />
                    </button>
                </div>
            )}

            {/* 상세 모달 */}
            {selected && createPortal(
                <div onClick={() => setSelected(null)} style={s.overlay}>
                    <div onClick={e => e.stopPropagation()} style={s.modal}>
                        {/* 헤더 */}
                        <div style={s.modalHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CreditCard size={18} color="#6366f1" />
                                <span style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>결제 상세</span>
                            </div>
                            <button style={s.closeBtn} onClick={() => setSelected(null)}>
                                <X size={15} />
                            </button>
                        </div>

                        {/* 금액 강조 */}
                        <div style={s.amountHero}>
                            <p style={s.amountHeroLabel}>결제 금액</p>
                            <p style={s.amountHeroValue}>₩{(selected.amount || 0).toLocaleString()}</p>
                            <span style={s.tokenBadge}><Ticket size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />+{selected.tokenCount} 토큰 지급</span>
                        </div>

                        {/* 상세 정보 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                            {[
                                { label: '사용자', value: selected.nickname },
                                { label: '이메일', value: selected.userEmail },
                                { label: '결제 수단', value: PAY_METHOD_LABEL[selected.payMethod] ?? selected.payMethod ?? '-' },
                                { label: '결제 일시', value: new Date(selected.createdAt).toLocaleString('ko-KR') },
                            ].map(({ label, value }) => (
                                <div key={label} style={s.infoBox}>
                                    <p style={s.infoLabel}>{label.toUpperCase()}</p>
                                    <p style={s.infoValue}>{value}</p>
                                </div>
                            ))}
                        </div>

                        <div style={s.idBox}>
                            <p style={s.infoLabel}>TRANSACTION ID</p>
                            <p style={{ ...s.infoValue, fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{selected.id}</p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    statsRow: {
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24,
    },
    statCard: {
        background: '#fff', borderRadius: 16, padding: '20px 24px',
        border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    },
    statLabel: { margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 },
    statValue: { margin: 0, fontSize: 22, fontWeight: 900, color: '#1e293b' },

    toolbar: {
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
    },
    searchWrap: {
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
        padding: '8px 14px', flex: 1, maxWidth: 360,
    },
    searchInput: {
        border: 'none', outline: 'none', fontSize: 13, color: '#374151',
        background: 'transparent', width: '100%',
    },
    searchBtn: {
        padding: '8px 18px', background: '#1e3a5f', color: '#fff',
        border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    },
    dateWrap: {
        position: 'relative', display: 'flex', alignItems: 'center',
    },
    dateInput: {
        padding: '8px 28px 8px 10px', borderRadius: 10, border: '1px solid #e2e8f0',
        fontSize: 13, color: '#374151', background: '#fff', outline: 'none', width: 100,
    },
    calBtn: {
        position: 'absolute', right: 8,
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', padding: 0,
    },
    resetBtn: {
        padding: '8px 14px', background: '#f1f5f9', color: '#64748b',
        border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    },
    totalBadge: { marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#94a3b8' },

    tableWrap: {
        background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { borderBottom: '1px solid #f1f5f9', background: '#f8fafc' },
    th: { padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.3 },
    tr: { borderBottom: '1px solid #f8fafc' },
    td: { padding: '12px 16px', verticalAlign: 'middle' },

    date: { fontSize: 12, color: '#94a3b8' },
    nickname: { fontSize: 13, fontWeight: 700, color: '#1e293b' },
    email: { fontSize: 12, color: '#64748b' },
    methodBadge: {
        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
        background: 'rgba(99,102,241,0.08)', color: '#6366f1',
    },
    tokenCount: { fontSize: 13, fontWeight: 800, color: '#6366f1' },
    amount: { fontSize: 13, fontWeight: 900, color: '#1e293b' },

    empty: { textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 13, fontWeight: 600 },

    pagination: {
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20,
    },
    pageBtn: {
        width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0',
        background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
    },
    pageActive: { background: '#1e3a5f', color: '#fff', border: '1px solid #1e3a5f' },

    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(15,32,56,0.35)',
        backdropFilter: 'blur(4px)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    },
    modal: {
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460,
        padding: '28px 32px', boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        animation: 'pmModalIn 0.22s ease', maxHeight: '85vh', overflowY: 'auto',
    },
    modalHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
    },
    closeBtn: {
        background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
        color: '#94a3b8', cursor: 'pointer', padding: '5px 7px', display: 'inline-flex', alignItems: 'center',
    },
    amountHero: {
        background: 'linear-gradient(135deg, #1e3a5f, #334e7a)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 16,
        textAlign: 'center',
    },
    amountHeroLabel: { margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
    amountHeroValue: { margin: '0 0 10px', fontSize: 28, fontWeight: 900, color: '#fff' },
    tokenBadge: {
        fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
        background: 'rgba(255,255,255,0.15)', color: '#fff',
    },
    infoBox: { background: '#f8fafc', borderRadius: 10, padding: '10px 14px' },
    infoLabel: { margin: '0 0 2px', fontSize: 10, fontWeight: 900, color: '#94a3b8', letterSpacing: 1 },
    infoValue: { margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' },
    idBox: { background: '#f8fafc', borderRadius: 10, padding: '10px 14px' },
};

export default PaymentManagement;
