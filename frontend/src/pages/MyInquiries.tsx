import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Clock, CheckCircle2, ChevronUp, Plus } from 'lucide-react'
import Header from '../components/Header'
import { getMyInquiries } from '../api/adminApi'
import { useAuthStore } from '../stores/useAuthStore'

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

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: '답변 대기', color: '#b45309', bg: 'rgba(251,191,36,0.12)' },
    replied: { label: '답변 완료', color: '#15803d', bg: 'rgba(34,197,94,0.12)' },
}

const CATEGORY_LABEL: Record<string, string> = {
    general: '일반 문의',
    account: '계정 문의',
    payment: '결제 문의',
    bug: '버그 신고',
    other: '기타',
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return '방금 전'
    if (m < 60) return `${m}분 전`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}시간 전`
    const d = Math.floor(h / 24)
    if (d < 7) return `${d}일 전`
    return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

export default function MyInquiries() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthStore()
    const [inquiries, setInquiries] = useState<MyInquiryResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<MyInquiryResponse | null>(null)
    const [showTop, setShowTop] = useState(false)

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 300)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return }
        getMyInquiries()
            .then(setInquiries)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [isAuthenticated, navigate])

    useEffect(() => {
        if (!selected) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [selected])

    return (
        <div style={s.bg} className="inq-bg">
            <Header />
            <style>{`
                @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes scaleUp { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
                .inq-item:hover { border-color: rgba(196,122,138,0.3) !important; box-shadow: 0 6px 24px rgba(107,130,160,0.14) !important; transform: translateY(-1px); }
                .inq-back:hover { background: rgba(107,130,160,0.12) !important; }
                .inq-top:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(107,130,160,0.3) !important; }
                .inq-new:hover { opacity: 0.88; transform: translateY(-1px); }
                @media (max-width: 640px) {
                    .inq-bg { padding: 80px 12px 60px !important; }
                    .inq-card { padding: 24px 16px !important; }
                    .inq-modal { padding: 24px 20px !important; max-width: calc(100vw - 32px) !important; }
                }
            `}</style>

            <main style={s.main}>
                <button className="inq-back" onClick={() => navigate(-1)} style={s.backBtn}>
                    <ArrowLeft size={15} strokeWidth={2.5} />
                    돌아가기
                </button>

                {/* 히어로 카드 */}
                <div style={s.heroCard} className="inq-card">
                    <p style={s.heroSub}>MY INQUIRIES</p>
                    <h1 style={s.heroTitle}>나의 문의</h1>
                    <p style={s.heroDesc}>
                        {loading ? '불러오는 중...' : inquiries.length > 0
                            ? `총 ${inquiries.length}개의 문의가 있어요.`
                            : '아직 접수한 문의가 없어요.'}
                    </p>
                </div>

                {/* 새 문의 버튼 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                    <button
                        className="inq-new"
                        onClick={() => navigate('/contact')}
                        style={s.newBtn}
                    >
                        <Plus size={14} strokeWidth={2.5} />
                        새 문의 접수
                    </button>
                </div>

                {/* 목록 */}
                {loading ? null : inquiries.length === 0 ? (
                    <div style={s.empty}>
                        <p style={{ margin: 0, fontSize: 15, color: '#9ca3af', fontWeight: 600 }}>아직 문의 내역이 없어요</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {inquiries.map((inq, i) => {
                            const meta = STATUS_META[inq.status] ?? STATUS_META.pending
                            return (
                                <div
                                    key={inq.id}
                                    className="inq-item"
                                    onClick={() => setSelected(inq)}
                                    style={{
                                        ...s.item,
                                        animation: `fadeUp ${0.3 + i * 0.04}s ease both`,
                                    }}
                                >
                                    {/* 상태 아이콘 */}
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <div style={{ ...s.iconBox, background: meta.bg }}>
                                            <MessageCircle size={20} color={meta.color} strokeWidth={2} />
                                        </div>
                                        <div style={{ ...s.statusBadge, background: meta.bg, color: meta.color }}>
                                            {inq.status === 'replied'
                                                ? <CheckCircle2 size={10} strokeWidth={2.5} />
                                                : <Clock size={10} strokeWidth={2.5} />
                                            }
                                        </div>
                                    </div>

                                    {/* 내용 */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={s.itemTitle}>{inq.title}</p>
                                        <p style={s.itemContent}>{inq.content}</p>
                                        <p style={s.itemTime}>{timeAgo(inq.createdAt)}</p>
                                    </div>

                                    {/* 우측 */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                        <span style={{ ...s.badge, background: meta.bg, color: meta.color }}>{meta.label}</span>
                                        <span style={{ fontSize: 11, color: '#cbd5e1' }}>
                                            {CATEGORY_LABEL[inq.category] ?? inq.category}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* 상세 모달 */}
            {selected && (() => {
                const meta = STATUS_META[selected.status] ?? STATUS_META.pending
                return (
                    <div style={s.overlay} onClick={() => setSelected(null)}>
                        <div style={s.modal} className="inq-modal" onClick={e => e.stopPropagation()}>
                            {/* 배지 + 닫기 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <span style={{ ...s.badge, background: meta.bg, color: meta.color, fontSize: 12 }}>{meta.label}</span>
                                <button onClick={() => setSelected(null)} style={s.modalClose}>✕</button>
                            </div>

                            {/* 비주얼 */}
                            <div style={s.visual}>
                                <div style={{ ...s.visualIconBox, background: meta.bg }}>
                                    <MessageCircle size={36} color={meta.color} strokeWidth={2} />
                                </div>
                                <div style={{ ...s.visualBadge, background: meta.color }}>
                                    {selected.status === 'replied'
                                        ? <CheckCircle2 size={12} color="#fff" strokeWidth={2.5} />
                                        : <Clock size={12} color="#fff" strokeWidth={2.5} />
                                    }
                                </div>
                            </div>

                            {/* 제목 / 설명 */}
                            <h3 style={s.modalTitle}>{selected.title}</h3>
                            <p style={s.modalCategory}>
                                {CATEGORY_LABEL[selected.category] ?? selected.category}
                            </p>
                            <p style={{ fontSize: 12, color: '#b0b8c8', marginBottom: 20 }}>{timeAgo(selected.createdAt)}</p>

                            {/* 문의 내용 */}
                            <div style={s.contentBox}>{selected.content}</div>

                            {/* 답변 */}
                            {selected.reply ? (
                                <div style={s.replyBox}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                        <CheckCircle2 size={14} color="#15803d" />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>관리자 답변</span>
                                        {selected.repliedAt && (
                                            <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                                {new Date(selected.repliedAt).toLocaleDateString('ko-KR')}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: 14, color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                        {selected.reply}
                                    </p>
                                </div>
                            ) : (
                                <div style={s.pendingBox}>
                                    <Clock size={14} color="#b45309" />
                                    <span>답변을 준비 중이에요. 잠시만 기다려 주세요.</span>
                                </div>
                            )}

                            {/* 버튼 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                                <button onClick={() => navigate('/contact')} style={s.modalPrimaryBtn}>새 문의 접수하기</button>
                                <button onClick={() => setSelected(null)} style={s.modalSecondaryBtn}>닫기</button>
                            </div>
                        </div>
                    </div>
                )
            })()}

            {/* 위로가기 */}
            <button
                className="inq-top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ ...s.topBtn, opacity: showTop ? 1 : 0, pointerEvents: showTop ? 'auto' : 'none', transform: showTop ? 'translateY(0)' : 'translateY(10px)' }}
            >
                <ChevronUp size={20} color="#6B82A0" strokeWidth={2.5} />
            </button>
        </div>
    )
}

const s: Record<string, React.CSSProperties> = {
    bg: {
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f5f0f8 0%, #ede8f2 40%, #f0eee9 100%)',
        padding: '110px 20px 80px',
    },
    main: {
        maxWidth: 680, margin: '0 auto',
        animation: 'fadeUp 0.5s ease both',
    },
    backBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        marginBottom: 24, padding: '8px 16px',
        fontSize: 13, fontWeight: 600, color: '#6B82A0',
        background: 'rgba(107,130,160,0.07)',
        border: '1.5px solid rgba(107,130,160,0.18)',
        borderRadius: 100, cursor: 'pointer', transition: 'background 0.15s',
    },
    heroCard: {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,240,248,0.85) 100%)',
        border: '1.5px solid rgba(255,255,255,0.75)',
        borderRadius: 24, padding: '32px 40px',
        boxShadow: '0 8px 40px rgba(107,130,160,0.13)',
        textAlign: 'center', marginBottom: 28,
    },
    heroSub: {
        fontSize: 11, fontWeight: 700, letterSpacing: 2,
        color: '#c47a8a', margin: '0 0 8px',
    },
    heroTitle: {
        fontSize: 28, fontWeight: 900, margin: '0 0 8px',
        background: 'linear-gradient(135deg, #c47a8a 0%, #6B82A0 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        letterSpacing: -0.5,
    },
    heroDesc: { fontSize: 13, color: '#9ca3af', margin: 0, fontWeight: 500 },
    newBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 18px', borderRadius: 100,
        background: 'linear-gradient(135deg, #c47a8a, #6B82A0)',
        color: '#fff', border: 'none', fontSize: 13, fontWeight: 700,
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: '0 4px 14px rgba(196,122,138,0.3)',
    },
    empty: {
        textAlign: 'center', padding: '60px 20px',
        background: 'rgba(255,255,255,0.7)', borderRadius: 20,
        border: '1.5px dashed rgba(107,130,160,0.2)',
    },
    item: {
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'rgba(255,255,255,0.88)',
        border: '1.5px solid rgba(107,130,160,0.12)',
        borderRadius: 16, padding: '16px 18px',
        cursor: 'pointer', transition: 'all 0.2s',
    },
    iconBox: {
        width: 46, height: 46, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    statusBadge: {
        position: 'absolute', bottom: -2, right: -2,
        width: 18, height: 18, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid white',
    },
    itemTitle: { fontSize: 14, fontWeight: 700, color: '#3d3d5c', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    itemContent: { fontSize: 12, color: '#9ca3af', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    itemTime: { fontSize: 12, color: '#9ca3af', margin: 0 },
    badge: {
        fontSize: 11, fontWeight: 700, padding: '3px 8px',
        borderRadius: 6, whiteSpace: 'nowrap' as const,
    },
    overlay: {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 24,
    },
    modal: {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(245,240,248,0.95) 100%)',
        border: '1.5px solid rgba(255,255,255,0.8)',
        borderRadius: 24, padding: '32px 36px',
        width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(107,130,160,0.2)',
        animation: 'scaleUp 0.22s ease both',
        textAlign: 'center' as const,
        maxHeight: '85vh', overflowY: 'auto',
    },
    modalClose: {
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 18, color: '#9ca3af', padding: 4, lineHeight: 1,
    },
    visual: {
        position: 'relative', display: 'flex', justifyContent: 'center',
        alignItems: 'center', height: 120, marginBottom: 20,
    },
    visualIconBox: {
        width: 88, height: 88, borderRadius: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
    },
    visualBadge: {
        position: 'absolute', bottom: 10, right: 'calc(50% - 54px)',
        width: 26, height: 26, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
    },
    modalTitle: { fontSize: 18, fontWeight: 800, color: '#3d3d5c', margin: '0 0 4px' },
    modalCategory: { fontSize: 12, color: '#9ca3af', margin: '0 0 4px' },
    contentBox: {
        background: 'rgba(107,130,160,0.06)', borderRadius: 14,
        padding: '14px 16px', fontSize: 14, color: '#334155',
        lineHeight: 1.7, whiteSpace: 'pre-wrap', textAlign: 'left' as const,
        marginBottom: 12,
    },
    replyBox: {
        background: 'rgba(34,197,94,0.07)', borderRadius: 14,
        padding: '14px 16px', textAlign: 'left' as const,
    },
    pendingBox: {
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 16px', borderRadius: 12,
        background: 'rgba(251,191,36,0.08)',
        fontSize: 13, color: '#b45309',
    },
    modalPrimaryBtn: {
        width: '100%', padding: '13px',
        background: 'linear-gradient(135deg, #c47a8a 0%, #6B82A0 100%)',
        color: '#fff', border: 'none', borderRadius: 10,
        fontSize: 14, fontWeight: 700, cursor: 'pointer',
    },
    modalSecondaryBtn: {
        width: '100%', padding: '11px',
        background: 'transparent', color: '#9ca3af',
        border: '1.5px solid rgba(107,130,160,0.18)', borderRadius: 10,
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
    },
    topBtn: {
        position: 'fixed', bottom: 36, right: 36,
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(107,130,160,0.2)',
        boxShadow: '0 4px 16px rgba(107,130,160,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 100, transition: 'all 0.25s',
    },
}
