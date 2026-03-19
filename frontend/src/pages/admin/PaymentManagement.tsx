import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

// 💳 결제 내역 타입 정의 (동일)
interface Payment {
    id: string;
    userId: string;
    userNickname: string;
    amount: number;
    tokenAmount: number;
    status: 'SUCCESS' | 'CANCELLED' | 'PENDING';
    method: string;
    createdAt: string;
}

const PaymentManagement = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const role = useAuthStore((state) => state.role);
    const accessToken = useAuthStore((state) => state.accessToken); // ✅ 토큰 가져오기 추가

    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    // 1️⃣ 결제 내역 가져오기 (인증 헤더 추가)
    const fetchPayments = useCallback(async () => {
        if (!accessToken) return; // ✅ 토큰 없으면 중단

        try {
            setLoading(true);
            const res = await axios.get('/api/admin/payments', {
                headers: {
                    Authorization: `Bearer ${accessToken}` // ✅ 인증 헤더 추가
                }
            });
            setPayments(res.data);
        } catch (err) {
            console.error("결제 내역 로딩 실패:", err);
        } finally {
            setLoading(false);
        }
    }, [accessToken]); // ✅ 의존성에 accessToken 추가

    useEffect(() => {
        if (isAuthenticated && role === 'ADMIN' && accessToken) {
            fetchPayments();
        }
    }, [isAuthenticated, role, accessToken, fetchPayments]);

    // 2️⃣ 결제 취소 핸들러 (인증 헤더 추가)
    const handleCancelPayment = async (paymentId: string) => {
        if (!confirm("정말로 이 결제를 취소 처리하시겠습니까? 지급된 토큰은 회수되지 않으니 주의하세요!")) return;

        try {
            await axios.post(`/api/admin/payments/${paymentId}/cancel`, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}` // ✅ 취소 요청에도 토큰 필요
                }
            });
            alert("결제가 취소 처리되었습니다.");
            fetchPayments();
        } catch (err) {
            console.error("결제 취소 실패:", err);
            alert("취소 처리에 실패했습니다.");
        }
    };

    if (!isAuthenticated || role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    // ... (상태 스타일 함수 및 JSX는 기존과 동일) ...

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'SUCCESS': return { backgroundColor: '#10B981', color: '#fff' };
            case 'CANCELLED': return { backgroundColor: '#EF4444', color: '#fff' };
            default: return { backgroundColor: '#F59E0B', color: '#fff' };
        }
    };

    return (
        <div style={s.container}>
            <header style={s.header}>
                <h1 style={s.title}>💳 결제 내역 관리</h1>
                <p style={s.meta}>서비스 내에서 발생한 모든 결제 이력을 확인합니다.</p>
            </header>

            <div style={s.tableSection}>
                <div style={s.tableWrapper}>
                    <table style={s.table}>
                        <thead>
                        <tr style={s.tr}>
                            <th style={s.th}>결제 일시</th>
                            <th style={s.th}>구매자</th>
                            <th style={s.th}>결제 금액</th>
                            <th style={s.th}>충전 토큰</th>
                            <th style={s.th}>상태</th>
                            <th style={s.th}>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{...s.td, textAlign: 'center', padding: '50px'}}>데이터 로딩 중... 🔄</td></tr>
                        ) : payments.length > 0 ? (
                            payments.map(p => (
                                <tr key={p.id} style={s.tr}>
                                    <td style={s.td}>{new Date(p.createdAt).toLocaleString()}</td>
                                    <td style={{...s.td, fontWeight: 700}}>{p.userNickname}</td>
                                    <td style={s.td}>₩ {p.amount.toLocaleString()}</td>
                                    <td style={{...s.td, color: '#6366F1', fontWeight: 800}}>{p.tokenAmount} 🐣</td>
                                    <td style={s.td}>
                                            <span style={{...s.badge, ...getStatusStyle(p.status)}}>
                                                {p.status === 'SUCCESS' ? '성공' : p.status === 'CANCELLED' ? '취소됨' : '대기'}
                                            </span>
                                    </td>
                                    <td style={s.td}>
                                        {p.status === 'SUCCESS' && (
                                            <button onClick={() => handleCancelPayment(p.id)} style={s.cancelBtn}>취소</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} style={{...s.td, textAlign: 'center', padding: '50px'}}>결제 내역이 없습니다.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ... (s 스타일 정의는 동일) ...
const s: Record<string, React.CSSProperties> = {
    container: { padding: '40px', maxWidth: '1100px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    title: { fontSize: '28px', fontWeight: 800, color: '#1E1B4B' },
    meta: { color: '#6366F1', fontWeight: 600 },
    tableSection: { marginTop: '20px' },
    tableWrapper: { backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: '25px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { backgroundColor: '#F9FAFB', padding: '15px', textAlign: 'left', color: '#4B5563', borderBottom: '2px solid #F3F4F6' },
    td: { padding: '15px', borderBottom: '1px solid #F3F4F6', color: '#1F2937' },
    tr: { transition: 'background 0.2s' },
    badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 },
    cancelBtn: { padding: '4px 10px', borderRadius: '6px', border: '1px solid #EF4444', color: '#EF4444', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }
};

export default PaymentManagement;