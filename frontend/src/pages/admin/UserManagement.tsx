import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { 
    getAllAdminUsers, 
    searchAdminUser, 
    toggleUserStatus, 
    giveManualToken,
    getTokenLogs
} from '../../api/adminApi';

interface User {
    id: string;
    nickname: string;
    email: string;
    role: string;
    tokenBalance: number;
    isActive: boolean;
    createdAt: string;
}

interface TokenLog {
    id: number;
    userId: string;
    nickname: string;
    amount: number;
    reason: string;
    createdAt: string;
}

const UserManagement = () => {
    const { accessToken } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [tokenLogs, setTokenLogs] = useState<TokenLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [activeTab, setActiveTab] = useState<'users' | 'tokens'>('users');

    // 🪙 토큰 지급 모달 상태
    const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [tokenAmount, setTokenAmount] = useState(0);
    const [tokenReason, setTokenReason] = useState('');

    const fetchData = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const [usersData, logsData] = await Promise.all([
                getAllAdminUsers(),
                getTokenLogs()
            ]);
            setUsers(usersData);
            setTokenLogs(logsData);
        } catch (err) {
            console.error("데이터 로드 실패:", err);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            void fetchData();
            return;
        }
        try {
            setLoading(true);
            const result = await searchAdminUser(searchKeyword);
            setUsers(result);
        } catch (err) {
            console.error("검색 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId: string) => {
        if (!confirm("해당 사용자의 활성 상태를 변경하시겠습니까?")) return;
        try {
            await toggleUserStatus(userId);
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
        } catch (err) {
            alert("상태 변경에 실패했습니다.");
        }
    };

    const handleGiveToken = async () => {
        if (!selectedUserId || tokenAmount <= 0) return;
        try {
            await giveManualToken(selectedUserId, tokenAmount, tokenReason);
            alert("토큰이 성공적으로 지급되었습니다. ✨");
            setIsTokenModalOpen(false);
            setTokenAmount(0);
            setTokenReason('');
            void fetchData();
        } catch (err) {
            alert("토큰 지급에 실패했습니다.");
        }
    };

    return (
        <div style={s.container}>
            <header style={s.header}>
                <div>
                    <h1 style={s.title}>사용자 거버넌스</h1>
                    <p style={s.subtitle}>이그에그 커뮤니티의 모든 구성원을 관리하고 소통하세요. 👥</p>
                </div>
                <div style={s.tabGroup}>
                    <button 
                        onClick={() => setActiveTab('users')} 
                        style={{...s.tab, backgroundColor: activeTab === 'users' ? '#0F172A' : '#F1F5F9', color: activeTab === 'users' ? '#FFF' : '#64748B'}}
                    >
                        전체 유저
                    </button>
                    <button 
                        onClick={() => setActiveTab('tokens')} 
                        style={{...s.tab, backgroundColor: activeTab === 'tokens' ? '#0F172A' : '#F1F5F9', color: activeTab === 'tokens' ? '#FFF' : '#64748B'}}
                    >
                        토큰 지급 내역
                    </button>
                </div>
            </header>

            {activeTab === 'users' ? (
                <>
                    {/* 🔍 검색 바 */}
                    <div style={s.searchBar}>
                        <input 
                            style={s.searchInput} 
                            placeholder="닉네임 또는 이메일로 검색..." 
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && void handleSearch()}
                        />
                        <button style={s.searchBtn} onClick={() => void handleSearch()}>유저 조회</button>
                    </div>

                    <div style={s.tableCard}>
                        <table style={s.table}>
                            <thead>
                                <tr style={s.thRow}>
                                    <th style={s.th}>가입일</th>
                                    <th style={s.th}>닉네임</th>
                                    <th style={s.th}>이메일</th>
                                    <th style={{...s.th, textAlign: 'center'}}>토큰 잔액</th>
                                    <th style={{...s.th, textAlign: 'center'}}>상태</th>
                                    <th style={{...s.th, textAlign: 'right'}}>제어</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} style={{ ...s.emptyTd, padding: '60px 0' }}> ⏳ 유저 정보를 불러오는 중입니다...</td></tr>
                                ) : users.length > 0 ? (
                                    users.map((u) => (
                                        <tr key={u.id} style={s.tr}>
                                            <td style={s.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td style={{...s.td, fontWeight: 700, color: '#1E293B'}}>{u.nickname}</td>
                                            <td style={s.td}>{u.email}</td>
                                            <td style={{...s.td, textAlign: 'center', fontWeight: 800, color: '#6366F1'}}>🪙 {(u.tokenBalance || 0).toLocaleString()}</td>
                                            <td style={{...s.td, textAlign: 'center'}}>
                                                <span style={{
                                                    ...s.statusBadge,
                                                    backgroundColor: u.isActive ? '#ECFDF5' : '#FEF2F2',
                                                    color: u.isActive ? '#10B981' : '#F43F5E'
                                                }}>
                                                    {u.isActive ? '재직중' : '활동정지'}
                                                </span>
                                            </td>
                                            <td style={{...s.td, textAlign: 'right'}}>
                                                <div style={s.actionGroup}>
                                                    <button 
                                                        onClick={() => { setSelectedUserId(u.id); setIsTokenModalOpen(true); }}
                                                        style={s.tokenBtn}
                                                    >
                                                        보상 지급
                                                    </button>
                                                    <button 
                                                        onClick={() => void handleToggleStatus(u.id)}
                                                        style={{...s.statusBtn, border: u.isActive ? '1px solid #FCA5A5' : '1px solid #10B981', color: u.isActive ? '#F43F5E' : '#10B981'}}
                                                    >
                                                        {u.isActive ? '정지' : '해제'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '80px 0', textAlign: 'center', background: 'linear-gradient(to bottom, #FFF, #F8FAFC)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '56px', height: '56px', backgroundColor: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '24px' }}>👥</span>
                                                </div>
                                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: 0 }}>등록된 사용자가 없습니다.</h3>
                                                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>이곳에서 회원들의 상태와 보상을 한눈에 관리할 수 있습니다.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div style={s.tableCard}>
                    <table style={s.table}>
                        <thead>
                            <tr style={s.thRow}>
                                <th style={s.th}>지급 시간</th>
                                <th style={s.th}>대상 유저</th>
                                <th style={{...s.th, textAlign: 'center'}}>지급량</th>
                                <th style={s.th}>지급 사유</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tokenLogs.length > 0 ? (
                                tokenLogs.map((log) => (
                                    <tr key={log.id} style={s.tr}>
                                        <td style={s.td}>{new Date(log.createdAt).toLocaleString()}</td>
                                        <td style={{...s.td, fontWeight: 700}}>{log.nickname}</td>
                                        <td style={{...s.td, textAlign: 'center', fontWeight: 800, color: '#6366F1'}}>+ {log.amount.toLocaleString()} 🪙</td>
                                        <td style={s.td}>{log.reason}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: '60px 0', textAlign: 'center', background: 'linear-gradient(to bottom, #FFF, #F9FAFB)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '48px', height: '48px', backgroundColor: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ fontSize: '20px' }}>🪙</span>
                                            </div>
                                            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', margin: 0 }}>토큰 지급 기록이 없습니다.</h3>
                                            <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>활동 중인 회원들에게 보상 차원의 토큰을 지급할 수 있습니다.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 🪙 토큰 지급 모달 */}
            {isTokenModalOpen && (
                <div style={s.modalOverlay}>
                    <div style={s.modal}>
                        <h2 style={s.modalTitle}>토큰 보상 지급</h2>
                        <p style={s.modalSubtitle}>사용자에게 특별한 보상을 선물하세요.</p>
                        
                        <div style={s.inputField}>
                            <label style={s.label}>지급 수량</label>
                            <input 
                                type="number" 
                                style={s.modalInput} 
                                value={tokenAmount} 
                                onChange={(e) => setTokenAmount(Number(e.target.value))}
                            />
                        </div>
                        
                        <div style={s.inputField}>
                            <label style={s.label}>지급 사유</label>
                            <input 
                                style={s.modalInput} 
                                placeholder="예: 커뮤니티 활동 우수 보상" 
                                value={tokenReason} 
                                onChange={(e) => setTokenReason(e.target.value)}
                            />
                        </div>

                        <div style={s.modalActions}>
                            <button onClick={() => void handleGiveToken()} style={s.confirmBtn}>지급 확정</button>
                            <button onClick={() => setIsTokenModalOpen(false)} style={s.cancelBtn}>취소</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    container: { padding: '20px 0' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' },
    title: { fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0 },
    subtitle: { fontSize: '15px', color: '#64748B', fontWeight: 500, marginTop: '4px' },
    
    tabGroup: { display: 'flex', gap: '8px', backgroundColor: '#F1F5F9', padding: '6px', borderRadius: '14px' },
    tab: { border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: '0.2s' },

    searchBar: { display: 'flex', gap: '12px', marginBottom: '30px' },
    searchInput: { flex: 1, padding: '16px 24px', borderRadius: '18px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', fontWeight: 500, backgroundColor: '#FFF' },
    searchBtn: { backgroundColor: '#6366F1', color: '#FFF', border: 'none', padding: '0 30px', borderRadius: '18px', fontWeight: 800, cursor: 'pointer' },

    tableCard: { backgroundColor: '#FFF', borderRadius: '30px', overflow: 'hidden', border: '1px solid #F1F5F9', boxShadow: '0 4px 30px rgba(0,0,0,0.02)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { backgroundColor: '#FAFCFE', borderBottom: '1px solid #F1F5F9' },
    th: { padding: '20px 25px', textAlign: 'left', fontSize: '11px', fontWeight: 900, color: '#94A3B8', letterSpacing: '1px' },
    td: { padding: '20px 25px', fontSize: '14px', color: '#64748B', borderBottom: '1px solid #F8FAFC' },
    tr: { transition: '0.2s' },

    statusBadge: { padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800 },
    actionGroup: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
    tokenBtn: { backgroundColor: '#F1F5F9', color: '#6366F1', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' },
    statusBtn: { backgroundColor: 'transparent', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' },

    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#FFF', width: '400px', padding: '40px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
    modalTitle: { fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0' },
    modalSubtitle: { fontSize: '14px', color: '#64748B', marginBottom: '30px' },
    inputField: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '12px', fontWeight: 800, color: '#94A3B8', marginBottom: '8px' },
    modalInput: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' },
    modalActions: { display: 'flex', gap: '12px', marginTop: '40px' },
    confirmBtn: { flex: 1, backgroundColor: '#6366F1', color: '#FFF', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' },
    cancelBtn: { flex: 1, backgroundColor: '#F1F5F9', color: '#64748B', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' },

    emptyTd: { padding: '100px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }
};

export default UserManagement;