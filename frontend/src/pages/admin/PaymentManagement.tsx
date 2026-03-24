import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import type { AdminPaymentRecord } from '../../api/payment';
import { getAdminPayments, cancelAdminPayment } from '../../api/payment';

const PaymentManagement = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const role = useAuthStore((state) => state.role);
    const accessToken = useAuthStore((state) => state.accessToken);

    const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ 필터 및 검색 상태 추가
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PAID, CANCELLED, READY
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPayments = useCallback(async () => {
        if (!accessToken) return;
        try {
            setLoading(true);
            const data = await getAdminPayments();
            let incomingData: AdminPaymentRecord[] = [];

            if (Array.isArray(data)) {
                incomingData = data as AdminPaymentRecord[];
            } else if (data && typeof data === 'object') {
                // ✅ any 제거: 응답 스키마 정의
                interface PaymentApiResponse {
                    content?: AdminPaymentRecord[];
                    data?: AdminPaymentRecord[];
                    items?: AdminPaymentRecord[];
                }
                const record = data as PaymentApiResponse;
                incomingData = record.content || record.data || record.items || [];
            }
            setPayments(incomingData);
        } catch (error) {
            console.error("💰 결제 내역 로딩 실패:", error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    // ✅ 클라이언트 측 필터링 및 검색 로직 (useMemo로 성능 최적화)
    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const s = p.status.toLowerCase();
            // 상태 필터링
            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'PAID' && (s === 'paid' || s === 'success')) ||
                (statusFilter === 'CANCELLED' && (s === 'cancelled' || s === 'cancel')) ||
                (statusFilter === 'READY' && s === 'ready');

            // 검색어 필터링 (닉네임, ID, 상품명)
            const search = searchTerm.toLowerCase();
            const matchesSearch =
                (p.userNickname?.toLowerCase() || "").includes(search) ||
                (p.userId || "").includes(search) ||
                (p.orderName?.toLowerCase() || "").includes(search);

            return matchesStatus && matchesSearch;
        });
    }, [payments, statusFilter, searchTerm]);

    const handleCancelClick = async (paymentId: string) => {
        if (!window.confirm("이 결제 건을 취소하시겠습니까?")) return;
        try {
            setLoading(true);
            await cancelAdminPayment(paymentId);
            alert("결제 취소가 정상적으로 처리되었습니다.");
            void fetchPayments();
        } catch (error) {
            // ✅ Axios 에러 구조를 안전하게 추출
            const err = error as { response?: { data?: { message?: string } } };
            console.error("취소 실패:", err);
            const errMsg = err.response?.data?.message || "결제 취소 중 오류 발생";
            alert(errMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const isAdmin = role === 'ADMIN' || String(role) === '100';
        if (isAuthenticated && isAdmin && accessToken) {
            void fetchPayments();
        }
    }, [isAuthenticated, role, accessToken, fetchPayments]);

    const getStatusInfo = (status: string) => {
        const s = String(status).toLowerCase();
        switch (s) {
            case 'paid': case 'success': return { text: '결제완료', color: '#10B981' };
            case 'cancelled': case 'cancel': return { text: '결제취소', color: '#EF4444' };
            case 'ready': return { text: '결제대기', color: '#F59E0B' };
            default: return { text: status.toUpperCase(), color: '#6B7280' };
        }
    };

    if (!isAuthenticated || (role !== 'ADMIN' && String(role) !== '100')) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={s.container}>
            <header style={s.header}>
                <div style={s.headerTop}>
                    <div>
                        <h1 style={s.title}>💳 결제 내역 관리</h1>
                        <p style={s.meta}>서비스 내 모든 결제 이력을 확인합니다.</p>
                    </div>
                    {/* ✅ 새로고침 버튼 */}
                    <button onClick={() => void fetchPayments()} style={s.refreshBtn} disabled={loading}>
                        {loading ? '갱신 중...' : '새로고침 🔄'}
                    </button>
                </div>

                {/* ✅ 필터 및 검색 바 섹션 */}
                <div style={s.filterBar}>
                    <div style={s.tabGroup}>
                        {['ALL', 'PAID', 'CANCELLED', 'READY'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                style={{
                                    ...s.filterTab,
                                    backgroundColor: statusFilter === f ? '#4F46E5' : '#fff',
                                    color: statusFilter === f ? '#fff' : '#6B7280',
                                    border: statusFilter === f ? '1px solid #4F46E5' : '1px solid #E5E7EB',
                                }}
                            >
                                {f === 'ALL' ? '전체' : f === 'PAID' ? '결제완료' : f === 'CANCELLED' ? '결제취소' : '대기'}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="닉네임, ID, 상품명 검색..."
                        style={s.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div style={s.tableSection}>
                <div style={s.tableWrapper}>
                    <table style={s.table}>
                        <thead>
                        <tr>
                            <th style={{ ...s.th, textAlign: 'center' }}>결제 일시</th>
                            <th style={{ ...s.th, textAlign: 'center' }}>구매자 (ID)</th>
                            <th style={{ ...s.th, textAlign: 'center' }}>상품명</th>
                            <th style={{ ...s.th, textAlign: 'center' }}>금액</th>
                            <th style={{ ...s.th, textAlign: 'center' }}>결제 수단</th>
                            <th style={{ ...s.th, textAlign: 'center' }}>상태</th>
                            <th style={{ ...s.th, textAlign: 'center' }}>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={s.emptyTd}>데이터 로딩 중... 🔄</td></tr>
                        ) : filteredPayments.length > 0 ? (
                            filteredPayments.map(p => {
                                const statusInfo = getStatusInfo(p.status);
                                const canCancel = p.status.toLowerCase() === 'paid' || p.status.toLowerCase() === 'success';

                                return (
                                    <tr key={p.id} style={s.tr} className="hover-row">
                                        <td style={{ ...s.td, textAlign: 'center' }}>{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
                                        <td style={{ ...s.td, textAlign: 'center', fontWeight: 700 }}>
                                            {p.userNickname || `ID: ${p.userId?.slice(0, 8) ?? 'Unknown'}`}
                                        </td>
                                        <td style={{ ...s.td, textAlign: 'center' }}>{p.orderName}</td>
                                        <td style={{ ...s.td, textAlign: 'center', color: '#4F46E5', fontWeight: 800 }}>
                                            ₩ {p.amount.toLocaleString()}
                                        </td>
                                        <td style={{ ...s.td, textAlign: 'center' }}>{p.payMethod}</td>
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            <span style={{ ...s.badge, backgroundColor: statusInfo.color, color: '#fff' }}>
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            {canCancel ? (
                                                <button onClick={() => handleCancelClick(p.id)} style={s.cancelBtn}>취소</button>
                                            ) : (
                                                <span style={{ color: '#9CA3AF', fontSize: '12px' }}>-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan={7} style={s.emptyTd}>결과가 없습니다.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`.hover-row:hover { background-color: #F9FAFB; }`}</style>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
    title: { fontSize: '28px', fontWeight: 800, color: '#1E1B4B' },
    meta: { color: '#6366F1', fontWeight: 600, fontSize: '14px' },

    // ✅ 필터 및 검색 스타일
    filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' },
    tabGroup: { display: 'flex', gap: '8px' },
    filterTab: { padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
    searchInput: { flex: 1, maxWidth: '300px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '14px' },
    refreshBtn: { padding: '10px 18px', backgroundColor: '#EEF2FF', color: '#4F46E5', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', transition: '0.2s' },

    tableSection: { marginTop: '10px' },
    tableWrapper: { backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { backgroundColor: '#F9FAFB', padding: '15px', color: '#4B5563', borderBottom: '2px solid #F3F4F6', fontWeight: 700 },
    td: { padding: '15px', borderBottom: '1px solid #F3F4F6', color: '#1F2937', verticalAlign: 'middle' },
    tr: { transition: 'background 0.2s' },
    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-block', minWidth: '70px', textAlign: 'center' },
    emptyTd: { textAlign: 'center', padding: '100px 0', color: '#9CA3AF', fontSize: '16px' },
    cancelBtn: { padding: '6px 14px', backgroundColor: '#FEE2E2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }
};

export default PaymentManagement;