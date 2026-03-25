import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { MessageSquare, ChevronRight, Clock, CheckCircle2, X } from 'lucide-react'
import Header from '../components/Header'
import { getMyInquiries } from '../api/adminApi'

interface MyInquiryResponse {
    id: string
    title: string
    content: string
    category: string
    status: string
    reply: string | null
    createdAt: string
    repliedAt: string | null
}
import { useAuthStore } from '../stores/useAuthStore'

const STATUS_LABEL: Record<string, string> = {
    pending: '답변 대기',
    replied: '답변 완료',
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
    pending: { bg: 'rgba(251,191,36,0.12)', color: '#b45309' },
    replied: { bg: 'rgba(34,197,94,0.12)', color: '#15803d' },
}

const CATEGORY_LABEL: Record<string, string> = {
    general: '일반 문의',
    account: '계정 문의',
    payment: '결제 문의',
    bug: '버그 신고',
    other: '기타',
}

function DetailModal({ inquiry, onClose }: { inquiry: MyInquiryResponse; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onClose])

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(10,8,20,0.55)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
                    maxHeight: '80vh', overflow: 'auto',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
                    padding: '32px 32px 28px',
                    display: 'flex', flexDirection: 'column', gap: 20,
                }}
            >
                {/* 헤더 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: 12 }}>
                        <span style={{
                            fontSize: 11, fontWeight: 700,
                            background: STATUS_COLOR[inquiry.status]?.bg ?? 'rgba(107,130,160,0.1)',
                            color: STATUS_COLOR[inquiry.status]?.color ?? '#6b82a0',
                            borderRadius: 20, padding: '3px 10px',
                        }}>
                            {STATUS_LABEL[inquiry.status] ?? inquiry.status}
                        </span>
                        <h2 style={{ margin: '10px 0 4px', fontSize: 18, fontWeight: 800, color: '#1e293b' }}>
                            {inquiry.title}
                        </h2>
                        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                            {CATEGORY_LABEL[inquiry.category] ?? inquiry.category} &nbsp;·&nbsp;
                            {new Date(inquiry.createdAt).toLocaleString('ko-KR')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(107,130,160,0.08)', border: 'none', borderRadius: 10,
                            width: 32, height: 32, cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                    >
                        <X size={16} color="#64748b" />
                    </button>
                </div>

                {/* 문의 내용 */}
                <div style={{
                    background: '#f8fafc', borderRadius: 12, padding: '16px 18px',
                    fontSize: 14, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap',
                }}>
                    {inquiry.content}
                </div>

                {/* 답변 */}
                {inquiry.reply ? (
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <CheckCircle2 size={16} color="#15803d" />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>관리자 답변</span>
                            {inquiry.repliedAt && (
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                    {new Date(inquiry.repliedAt).toLocaleString('ko-KR')}
                                </span>
                            )}
                        </div>
                        <div style={{
                            background: 'rgba(34,197,94,0.06)', borderRadius: 12,
                            padding: '14px 18px', fontSize: 14, color: '#1e293b',
                            lineHeight: 1.7, whiteSpace: 'pre-wrap',
                        }}>
                            {inquiry.reply}
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '12px 16px', borderRadius: 12,
                        background: 'rgba(251,191,36,0.08)',
                        fontSize: 13, color: '#b45309',
                    }}>
                        <Clock size={15} />
                        답변을 준비 중입니다. 잠시만 기다려 주세요.
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}

export default function MyInquiries() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthStore()
    const [inquiries, setInquiries] = useState<MyInquiryResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<MyInquiryResponse | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        getMyInquiries()
            .then(setInquiries)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [isAuthenticated, navigate])

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <Header />
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '110px 24px 60px' }}>
                {/* 타이틀 */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <MessageSquare size={22} color="#6b82a0" />
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1e293b' }}>내 문의 내역</h1>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>
                        접수한 문의와 답변을 확인할 수 있어요.
                    </p>
                </div>

                {/* 새 문의 버튼 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <button
                        onClick={() => navigate('/contact')}
                        style={{
                            padding: '9px 20px', borderRadius: 12, border: 'none',
                            background: 'linear-gradient(135deg, #6b82a0, #c47a8a)',
                            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        + 새 문의 접수
                    </button>
                </div>

                {/* 목록 */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 14 }}>
                        불러오는 중...
                    </div>
                ) : inquiries.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 0',
                        background: '#fff', borderRadius: 16,
                        color: '#94a3b8', fontSize: 14,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}>
                        <MessageSquare size={36} color="#cbd5e1" style={{ marginBottom: 12 }} />
                        <p style={{ margin: 0 }}>접수한 문의가 없어요.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {inquiries.map(inq => (
                            <button
                                key={inq.id}
                                onClick={() => setSelected(inq)}
                                style={{
                                    width: '100%', background: '#fff', border: '1px solid #f1f5f9',
                                    borderRadius: 14, padding: '16px 20px',
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    cursor: 'pointer', textAlign: 'left',
                                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                                    transition: 'box-shadow 0.15s, border-color 0.15s',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
                                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'
                                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#f1f5f9'
                                }}
                            >
                                {/* 상태 아이콘 */}
                                <div style={{
                                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                    background: STATUS_COLOR[inq.status]?.bg ?? 'rgba(107,130,160,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {inq.status === 'replied'
                                        ? <CheckCircle2 size={18} color="#15803d" />
                                        : <Clock size={18} color="#b45309" />
                                    }
                                </div>

                                {/* 내용 */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700,
                                            background: STATUS_COLOR[inq.status]?.bg ?? 'rgba(107,130,160,0.1)',
                                            color: STATUS_COLOR[inq.status]?.color ?? '#6b82a0',
                                            borderRadius: 20, padding: '2px 8px',
                                        }}>
                                            {STATUS_LABEL[inq.status] ?? inq.status}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#cbd5e1' }}>
                                            {CATEGORY_LABEL[inq.category] ?? inq.category}
                                        </span>
                                    </div>
                                    <p style={{
                                        margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {inq.title}
                                    </p>
                                    <p style={{
                                        margin: '3px 0 0', fontSize: 12, color: '#94a3b8',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {inq.content}
                                    </p>
                                </div>

                                {/* 날짜 + 화살표 */}
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                                        {new Date(inq.createdAt).toLocaleDateString('ko-KR')}
                                    </p>
                                    <ChevronRight size={16} color="#cbd5e1" style={{ marginTop: 4 }} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selected && <DetailModal inquiry={selected} onClose={() => setSelected(null)} />}
        </div>
    )
}
