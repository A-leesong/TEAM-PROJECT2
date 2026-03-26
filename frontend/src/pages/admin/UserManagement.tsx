import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Search, Ticket, ShieldOff, ShieldCheck, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
    getAllAdminUsers, searchAdminUser, toggleUserStatus,
    giveManualToken, getTokenLogs
} from '../../api/adminApi';

interface User {
    id: string; nickname: string; email: string;
    role: string; tokenBalance: number; isActive: boolean; createdAt: string;
}
interface TokenLog {
    id: number; user: { nickname: string };
    amount: number; reason: string; createdAt: string;
}

const UserManagement = () => {
    const { accessToken } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [tokenLogs, setTokenLogs] = useState<TokenLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [activeTab, setActiveTab] = useState<'users' | 'tokens'>('users');
    const [userPage, setUserPage] = useState(0);
    const PAGE_SIZE = 10;
    const [tokenModal, setTokenModal] = useState<{ id: string; nickname: string } | null>(null);
    const [tokenAmount, setTokenAmount] = useState(0);
    const [tokenReason, setTokenReason] = useState('');
    const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const [u, l] = await Promise.all([getAllAdminUsers(), getTokenLogs()]);
            setUsers(u); setTokenLogs(l);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [accessToken]);

    useEffect(() => { void fetchData(); }, [fetchData]);

    const handleSearch = async () => {
        setUserPage(0);
        if (!searchInput.trim()) { void fetchData(); return; }
        try {
            setLoading(true);
            setUsers(await searchAdminUser(searchInput));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleToggleStatus = async (userId: string) => {
        try {
            await toggleUserStatus(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
            setConfirmStatus(null);
        } catch { alert('상태 변경에 실패했습니다.'); }
    };

    const handleGiveToken = async () => {
        if (!tokenModal || tokenAmount <= 0) return;
        try {
            await giveManualToken(tokenModal.id, tokenAmount, tokenReason);
            setTokenModal(null); setTokenAmount(0); setTokenReason('');
            void fetchData();
        } catch { alert('토큰 지급에 실패했습니다.'); }
    };

    return (
        <div>
            <style>{`
                .um-row:hover { background: #f8fafc !important; }
                .um-tab-btn:hover { background: #f1f5f9 !important; }
                .um-token-btn:hover { background: #eef2ff !important; }
                .um-stop-btn:hover { background: #fef2f2 !important; }
                .um-go-btn:hover { background: #f0fdf4 !important; }
            `}</style>

            {/* 탭 + 검색 */}
            <div style={s.toolbar}>
                <div style={s.tabs}>
                    {(['users', 'tokens'] as const).map(t => (
                        <button key={t} className="um-tab-btn" onClick={() => setActiveTab(t)}
                            style={{ ...s.tabBtn, ...(activeTab === t ? s.tabActive : {}) }}>
                            {t === 'users' ? '전체 유저' : '토큰 지급 내역'}
                        </button>
                    ))}
                </div>

                {activeTab === 'users' && (
                    <div style={s.searchRow}>
                        <div style={s.searchWrap}>
                            <Search size={14} color="#94a3b8" />
                            <input style={s.searchInput} placeholder="닉네임 또는 이메일 검색"
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && void handleSearch()} />
                        </div>
                        <button style={s.searchBtn} onClick={() => void handleSearch()}>검색</button>
                        <span style={s.totalBadge}>총 {users.length.toLocaleString()}명</span>
                    </div>
                )}
            </div>

            {/* 유저 테이블 */}
            {activeTab === 'users' && (
                <>
                <div style={{ ...s.tableWrap, opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    <table style={s.table}>
                        <thead>
                            <tr style={s.thead}>
                                {['닉네임', '이메일', '가입일', '토큰 잔액', '상태', '관리'].map(h => (
                                    <th key={h} style={{ ...s.th, textAlign: ['토큰 잔액', '상태', '관리'].includes(h) ? 'center' : 'left' as any }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && !loading ? (
                                <tr><td colSpan={6} style={s.empty}>유저가 없습니다</td></tr>
                            ) : users.slice(userPage * PAGE_SIZE, (userPage + 1) * PAGE_SIZE).map(u => (
                                <tr key={u.id} className="um-row" style={s.tr}>
                                    <td style={s.td}>
                                        <div style={s.nickWrap}>
                                            <div style={s.avatar}>{u.nickname?.charAt(0)?.toUpperCase()}</div>
                                            <span style={s.nickText}>{u.nickname}</span>
                                        </div>
                                    </td>
                                    <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>{u.email}</td>
                                    <td style={{ ...s.td, color: '#94a3b8', fontSize: 12 }}>
                                        {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                                    </td>
                                    <td style={{ ...s.td, textAlign: 'center' }}>
                                        <span style={s.tokenBadge}>{(u.tokenBalance || 0).toLocaleString()}</span>
                                    </td>
                                    <td style={{ ...s.td, textAlign: 'center' }}>
                                        <span style={{ ...s.statusBadge, ...(u.isActive ? s.statusActive : s.statusInactive) }}>
                                            {u.isActive ? '활성' : '정지'}
                                        </span>
                                    </td>
                                    <td style={{ ...s.td, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                            <button className="um-token-btn" style={s.actionBtn}
                                                onClick={() => setTokenModal({ id: u.id, nickname: u.nickname })}
                                                title="토큰 지급">
                                                <Ticket size={13} color="#6366f1" />
                                            </button>
                                            {confirmStatus === u.id ? (
                                                <>
                                                    <button style={s.confirmBtn} onClick={() => void handleToggleStatus(u.id)}>확인</button>
                                                    <button style={s.cancelBtn} onClick={() => setConfirmStatus(null)}>취소</button>
                                                </>
                                            ) : (
                                                <button
                                                    className={u.isActive ? 'um-stop-btn' : 'um-go-btn'}
                                                    style={{ ...s.actionBtn }}
                                                    onClick={() => setConfirmStatus(u.id)}
                                                    title={u.isActive ? '정지' : '활성화'}>
                                                    {u.isActive
                                                        ? <ShieldOff size={13} color="#ef4444" />
                                                        : <ShieldCheck size={13} color="#10b981" />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                {Math.ceil(users.length / PAGE_SIZE) > 1 && (
                    <div style={s.pagination}>
                        <button className="al-page-btn" style={s.pageBtn} onClick={() => setUserPage(0)} disabled={userPage === 0}><ChevronsLeft size={15} /></button>
                        <button className="al-page-btn" style={s.pageBtn} onClick={() => setUserPage(p => Math.max(0, p - 1))} disabled={userPage === 0}><ChevronLeft size={15} /></button>
                        {Array.from({ length: Math.ceil(users.length / PAGE_SIZE) }, (_, i) => i)
                            .slice(Math.max(0, userPage - 2), Math.min(Math.ceil(users.length / PAGE_SIZE), userPage + 3))
                            .map(i => (
                                <button key={i} className="al-page-btn"
                                    style={{ ...s.pageBtn, ...(i === userPage ? s.pageActive : {}) }}
                                    onClick={() => setUserPage(i)}>{i + 1}</button>
                            ))}
                        <button className="al-page-btn" style={s.pageBtn} onClick={() => setUserPage(p => Math.min(Math.ceil(users.length / PAGE_SIZE) - 1, p + 1))} disabled={userPage === Math.ceil(users.length / PAGE_SIZE) - 1}><ChevronRight size={15} /></button>
                        <button className="al-page-btn" style={s.pageBtn} onClick={() => setUserPage(Math.ceil(users.length / PAGE_SIZE) - 1)} disabled={userPage === Math.ceil(users.length / PAGE_SIZE) - 1}><ChevronsRight size={15} /></button>
                    </div>
                )}
                </>
            )}

            {/* 토큰 로그 테이블 */}
            {activeTab === 'tokens' && (
                <div style={s.tableWrap}>
                    <table style={s.table}>
                        <thead>
                            <tr style={s.thead}>
                                {['유저', '지급량', '사유', '지급 시간'].map(h => (
                                    <th key={h} style={{ ...s.th, textAlign: h === '지급량' ? 'center' : 'left' as any }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tokenLogs.length === 0 ? (
                                <tr><td colSpan={4} style={s.empty}>지급 내역이 없습니다</td></tr>
                            ) : tokenLogs.map(log => (
                                <tr key={log.id} className="um-row" style={s.tr}>
                                    <td style={s.td}><span style={s.nickText}>{log.user?.nickname}</span></td>
                                    <td style={{ ...s.td, textAlign: 'center' }}>
                                        <span style={s.tokenBadge}>+{log.amount.toLocaleString()}</span>
                                    </td>
                                    <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>{log.reason}</td>
                                    <td style={{ ...s.td, color: '#94a3b8', fontSize: 12 }}>
                                        {new Date(log.createdAt).toLocaleString('ko-KR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 토큰 지급 모달 */}
            {tokenModal && (
                <div style={s.overlay} onClick={() => setTokenModal(null)}>
                    <div style={s.modal} onClick={e => e.stopPropagation()}>
                        <div style={s.modalHead}>
                            <div>
                                <p style={s.modalTitle}>토큰 지급</p>
                                <p style={s.modalSub}>{tokenModal.nickname} 님에게 지급</p>
                            </div>
                            <button style={s.closeBtn} onClick={() => setTokenModal(null)}><X size={16} /></button>
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>수량</label>
                            <input type="number" style={s.input} value={tokenAmount}
                                onChange={e => setTokenAmount(Number(e.target.value))} />
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>사유</label>
                            <input style={s.input} placeholder="예: 이벤트 보상"
                                value={tokenReason} onChange={e => setTokenReason(e.target.value)} />
                        </div>
                        <div style={s.modalBtns}>
                            <button style={s.modalCancel} onClick={() => setTokenModal(null)}>취소</button>
                            <button style={s.modalConfirm} onClick={() => void handleGiveToken()}>지급하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    toolbar: { marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 },
    tabs: { display: 'flex', gap: 6, background: '#f1f5f9', padding: 5, borderRadius: 12, width: 'fit-content' },
    tabBtn: {
        padding: '8px 20px', border: 'none', borderRadius: 8,
        fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#64748b', transition: 'all 0.15s',
    },
    tabActive: { background: '#fff', color: '#1e293b', fontWeight: 700, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    searchRow: { display: 'flex', alignItems: 'center', gap: 10 },
    searchWrap: {
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
        padding: '8px 14px', flex: 1, maxWidth: 360,
    },
    searchInput: { border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', width: '100%' },
    searchBtn: {
        padding: '8px 18px', background: '#1e3a5f', color: '#fff',
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
    tr: { borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' },
    td: { padding: '12px 16px', verticalAlign: 'middle', fontSize: 13, color: '#374151' },
    empty: { textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontSize: 13, fontWeight: 600 },

    nickWrap: { display: 'flex', alignItems: 'center', gap: 10 },
    avatar: {
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800,
    },
    nickText: { fontSize: 13, fontWeight: 700, color: '#1e293b' },
    tokenBadge: {
        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
        background: '#eef2ff', color: '#6366f1', fontSize: 12, fontWeight: 700,
    },
    statusBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
    statusActive: { background: '#f0fdf4', color: '#10b981' },
    statusInactive: { background: '#fef2f2', color: '#ef4444' },

    actionBtn: {
        width: 30, height: 30, border: '1px solid #e2e8f0', borderRadius: 8,
        background: '#fff', cursor: 'pointer', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
    },
    confirmBtn: {
        padding: '4px 10px', background: '#1e3a5f', color: '#fff',
        border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
    },
    cancelBtn: {
        padding: '4px 10px', background: '#f1f5f9', color: '#64748b',
        border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
    },

    overlay: {
        position: 'fixed', inset: 0, background: 'transparent',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000,
    },
    modal: {
        background: '#fff', width: 380, borderRadius: 20, padding: '28px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
    },
    modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    modalTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' },
    modalSub: { margin: '4px 0 0', fontSize: 12, color: '#94a3b8' },
    closeBtn: {
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#94a3b8', display: 'flex', padding: 4,
    },
    field: { marginBottom: 16 },
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 6 },
    input: {
        width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
        borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
    },
    modalBtns: { display: 'flex', gap: 10, marginTop: 24 },
    modalCancel: {
        flex: 1, padding: '11px', background: '#f1f5f9', color: '#64748b',
        border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    },
    modalConfirm: {
        flex: 1, padding: '11px', background: '#1e3a5f', color: '#fff',
        border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    },
    pagination: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 6, marginTop: 20,
    },
    pageBtn: {
        width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0',
        background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
    },
    pageActive: {
        background: '#1e3a5f', color: '#fff', border: '1px solid #1e3a5f',
    },
};

export default UserManagement;
