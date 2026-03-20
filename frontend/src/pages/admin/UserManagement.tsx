import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

// 👤 인터페이스 정의
interface UserInfo {
    id: string;
    nickname: string;
    email: string;
    tokenBalance: number;
    isSuspended: boolean;
    role: string;
    createdAt: string;
}

interface TokenLog {
    id: string;
    amount: number;
    reason: string;
    type: string;
    createdAt: string;
    user?: { id: string; nickname: string };
    admin?: { id: string; nickname: string } | null;
}

const UserManagement = () => {
    const { isAuthenticated, role, accessToken } = useAuthStore();

    // 상태 관리
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterSearchTerm, setFilterSearchTerm] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'USER' | 'ADMIN' | 'SUSPENDED'>('ALL');

    const [user, setUser] = useState<UserInfo | null>(null);
    const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
    const [tokenAmount, setTokenAmount] = useState(10);
    const [reason, setReason] = useState('결제 오류 보상');
    const [logs, setLogs] = useState<TokenLog[]>([]); // ✅ 이제 이 logs가 아래 테이블에서 사용됩니다.
    const [loading, setLoading] = useState(true);

    const getAuthHeader = useCallback(() => ({
        headers: { Authorization: `Bearer ${accessToken}` }
    }), [accessToken]);

    const fetchData = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const [logsRes, usersRes] = await Promise.all([
                axios.get('/api/admin/tokens/logs', getAuthHeader()),
                axios.get('/api/admin/users/all', getAuthHeader())
            ]);
            setLogs(logsRes.data);
            setAllUsers(usersRes.data);
        } catch (error) {
            console.error("데이터 로드 에러:", error);
        } finally {
            setLoading(false);
        }
    }, [accessToken, getAuthHeader]);

    useEffect(() => {
        const isAdmin = role === 'ADMIN' || String(role) === '100';
        if (isAuthenticated && isAdmin && accessToken) {
            void fetchData();
        }
    }, [isAuthenticated, role, accessToken, fetchData]);

    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => {
            const matchesFilter =
                filter === 'ALL' ||
                (filter === 'ADMIN' && u.role === 'ADMIN') ||
                (filter === 'USER' && u.role === 'USER') ||
                (filter === 'SUSPENDED' && u.isSuspended);

            const matchesSearch =
                u.nickname.toLowerCase().includes(filterSearchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(filterSearchTerm.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [allUsers, filter, filterSearchTerm]);

    const handleSearch = async (manualKeyword?: string) => {
        const keyword = manualKeyword ?? searchKeyword;
        if (!keyword.trim()) return;

        try {
            const res = await axios.get(`/api/admin/users/search`, {
                params: { keyword: keyword },
                ...getAuthHeader()
            });
            setUser(res.data);
        } catch {
            alert("유저를 찾을 수 없습니다.");
            setUser(null);
        }
    };

    const handleGiveToken = async () => {
        if (!user) return;
        if (tokenAmount <= 0) return alert("지급할 수량을 확인해주세요.");
        if (!confirm(`${user.nickname}님에게 ${tokenAmount} 토큰을 지급하시겠습니까?\n사유: ${reason}`)) return;

        try {
            await axios.post('/api/admin/tokens/manual', {
                userId: user.id,
                amount: tokenAmount,
                reason: reason
            }, getAuthHeader());

            alert("지급 완료!");
            const newBalance = user.tokenBalance + tokenAmount;
            setUser({ ...user, tokenBalance: newBalance });
            setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, tokenBalance: newBalance } : u));
            void fetchData(); // ✅ 로그 갱신을 위해 다시 불러오기
        } catch {
            alert("지급 실패");
        }
    };

    const handleToggleSuspension = async (targetUser: UserInfo) => {
        const action = targetUser.isSuspended ? "해제" : "정지";
        if (!confirm(`정말로 ${targetUser.nickname}님을 ${action}하시겠습니까?`)) return;
        try {
            await axios.patch(`/api/admin/users/${targetUser.id}/status`, {}, getAuthHeader());
            alert(`성공적으로 ${action}되었습니다.`);
            if (user && user.id === targetUser.id) {
                setUser({ ...user, isSuspended: !targetUser.isSuspended });
            }
            setAllUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, isSuspended: !u.isSuspended } : u));
        } catch {
            alert("상태 변경 실패");
        }
    };

    if (!isAuthenticated || (role !== 'ADMIN' && String(role) !== '100')) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={s.container}>
            <header style={s.header}>
                <h1 style={s.title}>👥 유저 통합 관리</h1>
                <p style={s.meta}>유저 검색, 정지 처리 및 토큰 수동 지급을 관리합니다.</p>
            </header>

            {/* 🔍 1. 유저 상세 검색 섹션 */}
            <div style={s.searchSection}>
                <input
                    type="text"
                    placeholder="지급 대상 유저 닉네임 또는 이메일 입력..."
                    style={s.searchInput}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void handleSearch()}
                />
                <button onClick={() => void handleSearch()} style={s.searchBtn}>대상 찾기</button>
            </div>

            {user && (
                <div style={s.userCard}>
                    <div style={s.userHeader}>
                        <div>
                            <h2 style={s.nickname}>{user.nickname} <span style={s.emailSpan}>({user.email})</span></h2>
                            <p style={{marginTop: '5px', fontSize: '14px', color: '#4C1D95', fontWeight: 700}}>
                                현재 보유량: 🪙 {user.tokenBalance.toLocaleString()} 토큰
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ ...s.statusBadge, backgroundColor: user.isSuspended ? '#EF4444' : '#10B981' }}>
                                {user.isSuspended ? "정지됨" : "정상 상태"}
                            </span>
                            <button onClick={() => void handleToggleSuspension(user)} style={{ ...s.suspendBtn, backgroundColor: user.isSuspended ? '#6366F1' : '#F43F5E' }}>
                                {user.isSuspended ? "🔓 정지 해제" : "🚫 계정 정지"}
                            </button>
                        </div>
                    </div>
                    <div style={s.divider} />
                    <div style={s.actionSection}>
                        <h3 style={s.sectionSubTitle}>💰 수동 토큰 지급 (CS 대응)</h3>
                        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <span style={{fontSize: '13px', fontWeight: 600}}>수량:</span>
                                <input type="number" style={{...s.input, width: '80px'}} value={tokenAmount} onChange={(e) => setTokenAmount(Number(e.target.value))} />
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '5px', flex: 1}}>
                                <span style={{fontSize: '13px', fontWeight: 600}}>사유:</span>
                                <select style={{...s.input, flex: 1}} value={reason} onChange={(e) => setReason(e.target.value)}>
                                    <option>결제 오류 보상</option>
                                    <option>이벤트 당첨</option>
                                    <option>시스템 장애 보상</option>
                                    <option>기타 (상세 사유 기록)</option>
                                </select>
                            </div>
                            <button onClick={() => void handleGiveToken()} style={s.inlineSubmitBtn}>지급 확정</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🛡️ 2. 필터 및 전체 목록 섹션 */}
            <div style={s.filterWrapper}>
                <div style={s.filterBar}>
                    {(['ALL', 'USER', 'ADMIN', 'SUSPENDED'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                ...s.filterBtn,
                                backgroundColor: filter === f ? '#7C3AED' : '#fff',
                                color: filter === f ? '#fff' : '#6B7280',
                                border: filter === f ? '1px solid #7C3AED' : '1px solid #E5E7EB',
                            }}
                        >
                            {f === 'ALL' ? '전체' : f === 'USER' ? '일반' : f === 'ADMIN' ? '관리자' : '정지됨'}
                        </button>
                    ))}
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={{fontSize: '13px', color: '#6B7280'}}>결과 내 검색:</span>
                    <input
                        type="text"
                        placeholder="닉네임/이메일..."
                        style={s.filterInput}
                        value={filterSearchTerm}
                        onChange={(e) => setFilterSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={s.logSection}>
                <div style={s.tableWrapper}>
                    <table style={s.table}>
                        <thead>
                        <tr style={s.tr}>
                            <th style={{...s.th, textAlign: 'center'}}>가입일</th>
                            <th style={s.th}>닉네임</th>
                            <th style={s.th}>이메일</th>
                            <th style={{...s.th, textAlign: 'center'}}>토큰 잔액</th>
                            <th style={{...s.th, textAlign: 'center'}}>상태</th>
                            <th style={{...s.th, textAlign: 'center'}}>액션</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={s.emptyTd}>데이터 로드 중...</td></tr>
                        ) : filteredUsers.length > 0 ? filteredUsers.map(u => (
                            <tr key={u.id} style={s.tr}>
                                <td style={{...s.td, textAlign: 'center'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td style={{...s.td, fontWeight: 700}}>{u.nickname}</td>
                                <td style={s.td}>{u.email}</td>
                                <td style={{...s.td, color: '#4C1D95', fontWeight: 700, textAlign: 'center'}}>🪙 {u.tokenBalance.toLocaleString()}</td>
                                <td style={{...s.td, textAlign: 'center'}}>
                                    <span style={{ color: u.isSuspended ? '#EF4444' : '#10B981', fontWeight: 800 }}>
                                        {u.isSuspended ? '정지' : '정상'}
                                    </span>
                                </td>
                                <td style={s.td}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                        <button
                                            onClick={() => {
                                                setSearchKeyword(u.nickname);
                                                void handleSearch(u.nickname); // ✅ 한 번 클릭 즉시 검색
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            style={{...s.tableActionBtn, backgroundColor: '#7C3AED'}}
                                        >
                                            지급
                                        </button>
                                        <button onClick={() => void handleToggleSuspension(u)} style={{ ...s.tableActionBtn, backgroundColor: u.isSuspended ? '#10B981' : '#EF4444' }}>
                                            {u.isSuspended ? '해제' : '정지'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} style={s.emptyTd}>검색 결과가 없습니다.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 📝 3. 이력 로그 섹션 (경고 해결 및 복구 완료) */}
            <div style={{...s.logSection, marginTop: '40px'}}>
                <h3 style={s.sectionSubTitle}>📝 최근 토큰 변동 이력</h3>
                <div style={s.tableWrapper}>
                    <table style={s.table}>
                        <thead>
                        <tr style={s.tr}>
                            <th style={{...s.th, textAlign: 'center'}}>일시</th>
                            <th style={s.th}>대상 유저</th>
                            <th style={{...s.th, textAlign: 'center'}}>변동 수량</th>
                            <th style={s.th}>상세 사유</th>
                            <th style={{...s.th, textAlign: 'center'}}>처리자</th>
                        </tr>
                        </thead>
                        <tbody>
                        {logs.length > 0 ? logs.map(log => {
                            const isSignup = log.reason?.includes('가입');
                            const isPurchase = log.type === 'purchase' || log.reason?.includes('구매');
                            return (
                                <tr key={log.id} style={s.tr}>
                                    <td style={{...s.td, textAlign: 'center', fontSize: '12px'}}>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</td>
                                    <td style={{...s.td, fontWeight: 600}}>{log.user?.nickname || "알 수 없음"}</td>
                                    <td style={{...s.td, color: isSignup ? '#10B981' : isPurchase ? '#3B82F6' : '#6366F1', fontWeight: 800, textAlign: 'center' }}>
                                        +{log.amount.toLocaleString()}
                                    </td>
                                    <td style={s.td}>
                                        <span style={{
                                            padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                            backgroundColor: isSignup ? '#D1FAE5' : isPurchase ? '#DBEAFE' : '#EEF2FF',
                                            color: isSignup ? '#065F46' : isPurchase ? '#1E40AF' : '#3730A3',
                                        }}>
                                            {log.reason}
                                        </span>
                                    </td>
                                    <td style={{...s.td, textAlign: 'center'}}>
                                        <span style={{color: !log.admin ? '#9CA3AF' : '#374151', fontSize: '12px'}}>
                                            {log.admin?.nickname || (log.type === 'MANUAL' ? '관리자' : '🤖 시스템')}
                                        </span>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan={5} style={s.emptyTd}>표시할 이력이 없습니다.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    container: { padding: '40px', maxWidth: '1100px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    title: { fontSize: '26px', fontWeight: 900, color: '#4C1D95' },
    meta: { color: '#6B7280', fontSize: '14px' },
    searchSection: { display: 'flex', gap: '10px', marginBottom: '25px' },
    searchInput: { flex: 1, padding: '12px 20px', borderRadius: '12px', border: '1px solid #DDD6FE', outline: 'none', boxShadow: '0 2px 4px rgba(124, 58, 237, 0.05)' },
    searchBtn: { padding: '0 25px', borderRadius: '12px', border: 'none', background: '#7C3AED', color: '#fff', fontWeight: 700, cursor: 'pointer' },
    filterWrapper: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '10px' },
    filterBar: { display: 'flex', gap: '5px' },
    filterBtn: { padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', transition: '0.2s', fontWeight: 600 },
    filterInput: { padding: '8px 15px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '13px', width: '180px', outline: 'none' },
    userCard: { backgroundColor: '#FDFCFE', borderRadius: '20px', padding: '25px', border: '2px solid #EDE9FE', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.05)', marginBottom: '30px' },
    userHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    nickname: { fontSize: '20px', fontWeight: 800, color: '#1F2937' },
    emailSpan: { fontSize: '14px', fontWeight: 400, color: '#9CA3AF', marginLeft: '5px' },
    statusBadge: { padding: '4px 10px', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center' },
    suspendBtn: { padding: '8px 16px', borderRadius: '10px', border: 'none', color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: '0.2s' },
    divider: { height: '1px', backgroundColor: '#EDE9FE', margin: '20px 0' },
    actionSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
    sectionSubTitle: { fontSize: '17px', fontWeight: 800, color: '#1F2937', marginBottom: '10px' },
    input: { padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' },
    inlineSubmitBtn: { padding: '10px 20px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' },
    logSection: { marginTop: '10px' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', border: '1px solid #E5E7EB' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { backgroundColor: '#F9FAFB', padding: '15px', textAlign: 'left', color: '#6B7280', borderBottom: '1px solid #E5E7EB' },
    td: { padding: '15px', borderBottom: '1px solid #F3F4F6', color: '#374151', verticalAlign: 'middle' },
    tr: { transition: 'background 0.2s' },
    tableActionBtn: { padding: '6px 12px', borderRadius: '6px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', minWidth: '45px' },
    emptyTd: { textAlign: 'center', padding: '50px', color: '#9CA3AF' }
};

export default UserManagement;