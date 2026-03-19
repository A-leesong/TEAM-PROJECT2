import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

// 💳 DB 컬럼명에 맞춘 타입 정의
interface Payment {
    id: string;          // b3d94727...
    userId: string;      // 107ecf42...
    amount: number;      // 2900
    status: string;      // 'paid' (DB 데이터 확인됨)
    payMethod: string;   // 'tosspay'
    orderName: string;   // 'Basic'
    orderId: string;     // egag_basic_...
    createdAt: string;   // 2026-03-19...
    userNickname?: string; // 조인 데이터가 없을 경우를 대비
}

const PaymentManagement = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const role = useAuthStore((state) => state.role);
    const accessToken = useAuthStore((state) => state.accessToken);

    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const getAuthHeader = useCallback(() => ({
        headers: { Authorization: `Bearer ${accessToken}` }
    }), [accessToken]);

    const fetchPayments = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/payments', getAuthHeader());

            // 데이터 구조 유연하게 처리 (res.data 또는 res.data.content)
            const incomingData = Array.isArray(res.data)
                ? res.data
                : (res.data?.content || res.data?.data || []);

            setPayments(incomingData);
        } catch (err) {
            console.error("결제 내역 로딩 실패:", err);
        } finally {
            setLoading(false);
        }
    }, [accessToken, getAuthHeader]);

    useEffect(() => {
        if (isAuthenticated && (role === 'ADMIN' || String(role) === '100') && accessToken) {
            fetchPayments();
        }
    }, [isAuthenticated, role, accessToken, fetchPayments]);

    // 🎨 DB의 'paid' 상태를 포함한 스타일 처리
    const getStatusStyle = (status: string) => {
        const s = String(status).toLowerCase();
        switch (s) {
            case 'paid':
            case 'success':
                return { backgroundColor: '#10B981', color: '#fff' }; // 초록색
            case 'cancelled':
            case 'cancel':
            case 'fail':
                return { backgroundColor: '#EF4444', color: '#fff' }; // 빨간색
            default:
                return { backgroundColor: '#F59E0B', color: '#fff' }; // 주황색 (ready, pending 등)
        }
    };

    if (!isAuthenticated || (role !== 'ADMIN' && String(role) !== '100')) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={s.container}>
            <header style={s.header}>
                <h1 style={s.title}>💳 결제 내역 관리</h1>
                <p style={s.meta}>DB의 실시간 결제 이력을 관리합니다.</p>
            </header>

            <div style={s.tableSection}>
                <div style={s.tableWrapper}>
                    <table style={s.table}>
                        <thead>
                        <tr style={s.tr}>
                            <th style={s.th}>결제 일시</th>
                            <th style={s.th}>구매자 (ID)</th>
                            <th style={s.th}>상품명</th>
                            <th style={s.th}>금액</th>
                            <th style={s.th}>결제 수단</th>
                            <th style={s.th}>상태</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={s.emptyTd}>데이터 로딩 중... 🔄</td></tr>
                        ) : payments.length > 0 ? (
                            payments.map(p => (
                                <tr key={p.id} style={s.tr}>
                                    <td style={s.td}>{new Date(p.createdAt).toLocaleString()}</td>
                                    <td style={{...s.td, fontWeight: 700}}>
                                        {p.userNickname || `ID: ${p.userId.slice(0, 8)}...`}
                                    </td>
                                    <td style={s.td}>{p.orderName}</td>
                                    <td style={{...s.td, color: '#4F46E5', fontWeight: 800}}>
                                        ₩ {p.amount.toLocaleString()}
                                    </td>
                                    <td style={s.td}>{p.payMethod}</td>
                                    <td style={s.td}>
                                            <span style={{...s.badge, ...getStatusStyle(p.status)}}>
                                                {p.status === 'paid' ? '결제완료' : p.status.toUpperCase()}
                                            </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} style={s.emptyTd}>결제 내역이 없습니다.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    title: { fontSize: '28px', fontWeight: 800, color: '#1E1B4B' },
    meta: { color: '#6366F1', fontWeight: 600, fontSize: '14px' },
    tableSection: { marginTop: '20px' },
    tableWrapper: { backgroundColor: '#FFFFFF', borderRadius: '25px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { backgroundColor: '#F9FAFB', padding: '15px', textAlign: 'left', color: '#4B5563', borderBottom: '2px solid #F3F4F6' },
    td: { padding: '15px', borderBottom: '1px solid #F3F4F6', color: '#1F2937' },
    tr: { transition: 'background 0.2s' },
    badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 },
    emptyTd: { textAlign: 'center', padding: '50px', color: '#9CA3AF' }
};

export default PaymentManagement;