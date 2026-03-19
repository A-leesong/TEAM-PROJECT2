import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

// 👤 전체 유저 정보 타입
interface UserListItem {
    id: string;
    nickname: string;
    email: string;
    role: 'ADMIN' | 'USER';
    tokenBalance: number;
    isSuspended: boolean;
    createdAt: string;
}

const UserManagement = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const role = useAuthStore((state) => state.role);

    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'ADMIN' | 'SUSPENDED'>('ALL');

    // 1️⃣ 전체 유저 목록 가져오기
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/users/all');
            setUsers(res.data);
        } catch (err) {
            console.error("유저 목록 로딩 실패:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && role === 'ADMIN') {
            fetchUsers();
        }
    }, [isAuthenticated, role, fetchUsers]);

    if (!isAuthenticated || role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    // 2️⃣ 필터링된 유저 목록
    const filteredUsers = users.filter(user => {
        if (filter === 'ADMIN') return user.role === 'ADMIN';
        if (filter === 'SUSPENDED') return user.isSuspended;
        return true;
    });

    return (
        <div style={s.container}>
            <header style={s.header}>
                <h1 style={s.title}>👥 전체 유저 목록</h1>
                <p style={s.meta}>서비스에 가입된 모든 유저를 관리합니다.</p>
            </header>

            {/* 🔍 필터 탭 */}
            <div style={s.filterBar}>
                {(['ALL', 'ADMIN', 'SUSPENDED'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            ...s.filterBtn,
                            backgroundColor: filter === f ? '#7C3AED' : '#fff',
                            color: filter === f ? '#fff' : '#4B5563',
                        }}
                    >
                        {f === 'ALL' ? '전체' : f === 'ADMIN' ? '관리자' : '정지 유저'}
                    </button>
                ))}
            </div>

            <div style={s.tableSection}>
                <div style={s.tableWrapper}>
                    <table style={s.table}>
                        <thead>
                        <tr style={s.tr}>
                            <th style={s.th}>가입일</th>
                            <th style={s.th}>닉네임</th>
                            <th style={s.th}>이메일</th>
                            <th style={s.th}>권한</th>
                            <th style={s.th}>잔여 토큰</th>
                            <th style={s.th}>상태</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{...s.td, textAlign: 'center', padding: '50px'}}>유저 데이터를 불러오는 중... 🔄</td></tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map(u => (
                                <tr key={u.id} style={s.tr}>
                                    <td style={s.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td style={{...s.td, fontWeight: 700}}>{u.nickname}</td>
                                    <td style={s.td}>{u.email}</td>
                                    <td style={s.td}>
                                            <span style={{...s.roleBadge, background: u.role === 'ADMIN' ? '#DDD6FE' : '#F3F4F6', color: u.role === 'ADMIN' ? '#5B21B6' : '#6B7280'}}>
                                                {u.role}
                                            </span>
                                    </td>
                                    <td style={{...s.td, fontWeight: 600}}>{u.tokenBalance} 🐣</td>
                                    <td style={s.td}>
                                            <span style={{color: u.isSuspended ? '#EF4444' : '#10B981', fontWeight: 700}}>
                                                {u.isSuspended ? '정지됨' : '정상'}
                                            </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} style={{...s.td, textAlign: 'center', padding: '50px'}}>조건에 맞는 유저가 없습니다.</td></tr>
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
    title: { fontSize: '28px', fontWeight: 800, color: '#4C1D95' },
    meta: { color: '#6D28D9', fontWeight: 600 },
    filterBar: { display: 'flex', gap: '10px', marginBottom: '20px' },
    filterBtn: { padding: '8px 16px', borderRadius: '10px', border: '1px solid #DDD6FE', cursor: 'pointer', fontWeight: 700, transition: '0.2s' },
    tableSection: { marginTop: '10px' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '25px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { backgroundColor: '#F9FAFB', padding: '15px', textAlign: 'left', color: '#4B5563', borderBottom: '2px solid #F3F4F6' },
    td: { padding: '15px', borderBottom: '1px solid #F3F4F6', color: '#1F2937' },
    tr: { transition: 'background 0.2s' },
    roleBadge: { padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 800 }
};

export default UserManagement;