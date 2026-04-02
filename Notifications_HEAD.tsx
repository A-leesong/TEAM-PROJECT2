import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, UserPlus, Palette, ChevronUp, Trash2, MessageCircle } from 'lucide-react'
import { getNotifications, markNotificationsAsRead, deleteNotification, deleteAllNotifications } from '../api/notification'
import { getArtwork } from '../api/artwork'
import type { NotificationResponse } from '../types'
import Header from '../components/Header'

const TYPE_META: Record<string, { icon: JSX.Element; color: string; bg: string; label: string }> = {
  LIKE:     { icon: <Heart size={16} strokeWidth={2.5} />,    color: '#c47a8a', bg: 'rgba(196,122,138,0.1)',  label: '醫뗭븘?? },
  FOLLOW:   { icon: <UserPlus size={16} strokeWidth={2.5} />, color: '#6B82A0', bg: 'rgba(107,130,160,0.1)', label: '?붾줈?? },
  FINISHED:      { icon: <Palette size={16} strokeWidth={2.5} />,       color: '#8a6ab0', bg: 'rgba(138,106,176,0.1)', label: '?꾩꽦' },
  INQUIRY_REPLY: { icon: <MessageCircle size={16} strokeWidth={2.5} />, color: '#4a9a7a', bg: 'rgba(74,154,122,0.1)',  label: '臾몄쓽 ?듬?' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '諛⑷툑 ??
  if (m < 60) return `${m}遺???
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}?쒓컙 ??
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}????
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [selected, setSelected] = useState<NotificationResponse | null>(null)
  const [selectedArtImageUrl, setSelectedArtImageUrl] = useState<string | null>(null)
  const [showTop, setShowTop] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications()
        setNotifications(data)
        if (data.length > 0) await markNotificationsAsRead()
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
      }
    }
    fetchNotifications()
  }, [])

  const closeStory = () => {
    setSelected(null)
    setSelectedArtImageUrl(null)
  }

  const goToDetail = () => {
    if (!selected) return
    if (selected.type === 'FOLLOW') navigate(`/user/${selected.actorId}`)
    else if (selected.type === 'INQUIRY_REPLY') navigate('/contact')
    else if (selected.artworkId) navigate(`/artwork/${selected.artworkId}`)
    setSelected(null); setSelectedArtImageUrl(null)
  }

  const goToProfile = () => {
    if (selected?.actorId) { navigate(`/user/${selected.actorId}`); setSelected(null); setSelectedArtImageUrl(null) }
  }

  const avatarSrc = (url?: string | null) =>
    url ? (url.startsWith('/uploads') ? `http://localhost:8080${url}` : url) : null

  return (
    <div style={s.bg} className="notif-bg">
      <Header />

      {/* --- ?꾩슜 ?뚮┝ ?ㅽ넗由?紐⑤떖 --- */}
      {selected && (
        <div className="modal-overlay" onClick={closeStory} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, animation: 'fadeIn 0.3s ease-out'
        }}>
          <div className="story-modal" onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 500, background: '#fff', borderRadius: 48,
            padding: 40, position: 'relative', textAlign: 'center',
            boxShadow: '0 30px 70px rgba(255, 133, 179, 0.15)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            transform: 'scale(1)', animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
          }}>
            <button onClick={closeStory} style={{
              position: 'absolute', top: 24, right: 24, background: '#F5F7FA',
              border: 'none', width: 40, height: 40, borderRadius: 20,
              fontSize: 20, cursor: 'pointer', color: '#8a8aaa', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>??/button>

            {/* 鍮꾩＜???뱀뀡 */}
            <div style={{ position: 'relative', height: 240, marginBottom: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {selected.type === 'LIKE' && (
                <>
                  <div style={{ 
                    width: 200, height: 200, borderRadius: 32, overflow: 'hidden', 
                    transform: 'rotate(-5deg)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    border: '8px solid white'
                  }}>
                    <img src={selected.artworkId ? `http://localhost:8080/api/artwork/${selected.artworkId}/image` : '/placeholder.png'} 
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ 
                    position: 'absolute', bottom: -10, right: 100, width: 80, height: 80, 
                    borderRadius: 30, overflow: 'hidden', border: '4px solid #fff',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)', transform: 'rotate(5deg)'
                  }}>
                    <img src={selected.actorProfileImage?.startsWith('/uploads') ? `http://localhost:8080${selected.actorProfileImage}` : (selected.actorProfileImage || '/default-avatar.png')} 
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ position: 'absolute', top: 20, right: 80, fontSize: 64, animation: 'float 3s infinite ease-in-out' }}>?ㅿ툘</div>
                </>
              )}
              {selected.type === 'FOLLOW' && (
                <>
                  <div style={{ 
                    width: 160, height: 160, borderRadius: 60, overflow: 'hidden', 
                    boxShadow: '0 15px 40px rgba(165, 216, 255, 0.3)',
                    border: '6px solid #A5D8FF'
                  }}>
                    <img src={selected.actorProfileImage?.startsWith('/uploads') ? `http://localhost:8080${selected.actorProfileImage}` : (selected.actorProfileImage || '/default-avatar.png')} 
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ position: 'absolute', top: 0, left: 60, fontSize: 48, animation: 'float 4s infinite ease-in-out' }}>??/div>
                  <div style={{ position: 'absolute', bottom: 20, right: 60, fontSize: 40, animation: 'float 3s infinite reverse ease-in-out' }}>?뙚</div>
                </>
              )}
               {selected.type === 'FINISHED' && (
                <>
                  <div style={{ 
                    width: 220, height: 180, borderRadius: 24, overflow: 'hidden', 
                    boxShadow: '0 15px 40px rgba(0,0,0,0.1)', transform: 'rotate(-2deg)',
                    border: '8px solid white'
                  }}>
                    <img src={selected.artworkId ? `http://localhost:8080/api/artwork/${selected.artworkId}/image` : '/placeholder.png'} 
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 50 }}>?렓</div>
                </>
              )}
                  {/* TOKEN (湲곕낯媛? */}
                  {selected.type === 'TOKEN' && (
                    <>
                      <div style={{ 
                        width: 160, height: 160, borderRadius: 40, background: 'rgba(255, 215, 0, 0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80,
                        boxShadow: '0 15px 40px rgba(255, 215, 0, 0.2)', border: '4px dashed #FFD700'
                      }}>
                        ?첌
                      </div>
                      <div style={{ position: 'absolute', top: 0, left: 60, fontSize: 40, animation: 'float 4s infinite ease-in-out' }}>??/div>
                      <div style={{ position: 'absolute', bottom: 20, right: 60, fontSize: 40, animation: 'float 3s infinite reverse ease-in-out' }}>?뭿</div>
                    </>
                  )}
                  {/* INQUIRY_REPLY */}
                  {selected.type === 'INQUIRY_REPLY' && (
                    <>
                      <div style={{ 
                        width: 160, height: 160, borderRadius: 40, background: 'rgba(107, 130, 160, 0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80,
                        boxShadow: '0 15px 40px rgba(107, 130, 160, 0.2)', border: '4px dashed #6B82A0'
                      }}>
                        ?됵툘
                      </div>
                      <div style={{ position: 'absolute', top: 0, left: 60, fontSize: 40, animation: 'float 4s infinite ease-in-out' }}>?뱷</div>
                      <div style={{ position: 'absolute', bottom: 20, right: 60, fontSize: 40, animation: 'float 3s infinite reverse ease-in-out' }}>??/div>
                    </>
                  )}
            </div>

            {/* 硫붿떆吏 ?뱀뀡 */}
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1a1a2e', marginBottom: 16, wordBreak: 'keep-all' }}>
              {selected.type === 'LIKE' && `${selected.actorNickname} 移쒓뎄媛 ??洹몃┝???꾩＜ 醫뗭븘?쒕???`}
              {selected.type === 'FOLLOW' && `${selected.actorNickname} 移쒓뎄???댁젣 ?⑥쭩???섏뿀?댁슂!`}
              {selected.type === 'FINISHED' && `??? ??洹몃┝???쒕뵒???꾩꽦?먯뼱??`}
              {selected.type === 'TOKEN' && `愿由ъ옄?섏씠 蹂대궦 蹂대꼫???좊Ъ???꾩갑?덉뼱??`}
              {selected.type === 'INQUIRY_REPLY' && `臾몄쓽?섏떊 ?댁슜???듬????꾩갑?덉뼱??`}
            </h2>
            <p style={{ fontSize: 16, color: '#6B82A0', fontWeight: 600, marginBottom: 32, lineHeight: 1.6 }}>
              {selected.type === 'LIKE' && '?닿? ?뺤꽦猿?洹몃┛ 洹몃┝??移쒓뎄??留덉쓬???곕쑜?섍쾶 留뚮뱾?덈굹 遊먯슂. ?ㅿ툘'}
              {selected.type === 'FOLLOW' && '?욎쑝濡??쒕줈??硫뗭쭊 洹몃┝?ㅼ쓣 ??留롮씠 援ш꼍?????덇쾶 ?섏뿀?댁슂! ??}
              {selected.type === 'FINISHED' && '吏湲?諛붾줈 ?꾩꽦??洹몃┝???뺤씤?섎윭 媛蹂쇨퉴?? ?렓'}
              {selected.type === 'TOKEN' && (
                <>
                  ?곕━ 而ㅻ??덊떚瑜?鍮쏅궡二쇱뀛??媛먯궗?⑸땲?? ??br/>
                  蹂댁긽 ?좏겙: <strong>{selected.amount || 1}媛?/strong><br/>
                  ?ъ쑀: <span style={{ color: '#c47a8a' }}>{selected.reason || '愿由ъ옄 蹂댁긽'}</span>
                </>
              )}
              {selected.type === 'INQUIRY_REPLY' && (
                <>
                  臾몄쓽?섏떊 <span style={{ color: '#6B82A0' }}>"{selected.reason}"</span>?????br/>
                  ?꾨Ц媛 ?좎깮?섏쓽 ?듬????깅줉?섏뿀?듬땲?? 吏湲?諛붾줈 ?뺤씤?대낫?몄슂!
                </>
              )}
            </p>

            {/* 踰꾪듉 ?뱀뀡 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(selected.type === 'LIKE' || selected.type === 'FINISHED') && (
                <button 
                  onClick={goToDetail}
                  style={{ 
                    background: 'linear-gradient(135deg, #FF85B3, #FF5C8D)', 
                    color: '#fff', border: 'none', padding: '16px', 
                    borderRadius: 24, fontSize: 16, fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(255, 92, 141, 0.25)' 
                  }}
                >
                  洹몃┝ 援ш꼍?섎윭 媛湲? ?뼹截?                </button>
              )}
              {selected.type === 'TOKEN' && (
                <button 
                  onClick={() => navigate('/token-shop')}
                  style={{ 
                    background: 'linear-gradient(135deg, #FFD700, #DAA520)', 
                    color: '#fff', border: 'none', padding: '16px', 
                    borderRadius: 24, fontSize: 16, fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(218, 165, 32, 0.25)' 
                  }}
                >
                  ?좏겙 ?곸젏 媛湲? ?첌
                </button>
              )}
              <button 
                onClick={goToProfile}
                style={{ 
                  background: '#F5F7FA', color: '#4A6A8A', border: 'none', 
                  padding: '16px', borderRadius: 24, fontSize: 16, 
                  fontWeight: 800, cursor: 'pointer' 
                }}
              >
                {selected.type === 'FOLLOW' ? '移쒓뎄 ?꾨줈??蹂닿린 ?맽' : '移쒓뎄 ?뚯떇 沅곴툑?? ?맽'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ?좊땲硫붿씠???뺤쓽 */}
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleUp { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .notif-item:hover { border-color: rgba(196,122,138,0.3) !important; box-shadow: 0 6px 24px rgba(107,130,160,0.14) !important; transform: translateY(-1px); }
        .notif-back:hover { background: rgba(107,130,160,0.12) !important; }
        .notif-top:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(107,130,160,0.3) !important; }
        .notif-del:hover { color: #e05a6a !important; background: rgba(224,90,106,0.08) !important; }
        .notif-del-all:hover { color: #e05a6a !important; border-color: rgba(224,90,106,0.5) !important; }
        @media (max-width: 640px) {
          .notif-bg { padding: 80px 12px 60px !important; }
          .notif-card { padding: 24px 16px !important; }
          .notif-modal { padding: 24px 20px !important; max-width: calc(100vw - 32px) !important; }
        }
      `}</style>

      <main style={s.main}>
        <button className="notif-back" onClick={() => navigate(-1)} style={s.backBtn}>
          <ArrowLeft size={15} strokeWidth={2.5} />
          ?뚯븘媛湲?        </button>

        {/* ?ㅻ뜑 */}
        <div style={s.heroCard} className="notif-card">
          <p style={s.heroSub}>MY NOTIFICATIONS</p>
          <h1 style={s.heroTitle}>???뚯떇</h1>
          <p style={s.heroDesc}>
            {notifications.length > 0 ? `珥?${notifications.length}媛쒖쓽 ?뚮┝???덉뼱??` : '?꾩쭅 ?꾩갑???뚯떇???놁뼱??'}
          </p>
        </div>

        {/* ?꾩껜 ??젣 */}
        {notifications.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              className="notif-del-all"
              onClick={() => {
                if (!confirm('?뚮┝??紐⑤몢 ??젣?좉퉴??')) return
                deleteAllNotifications().then(() => setNotifications([]))
              }}
              style={s.delAllBtn}
            >
              <Trash2 size={13} strokeWidth={2} /> ?꾩껜 ??젣
            </button>
          </div>
        )}

        {/* ?뚮┝ 紐⑸줉 */}
        {notifications.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>?맋</div>
            <p style={{ margin: 0, fontSize: 15, color: '#9ca3af', fontWeight: 600 }}>?꾩쭅 ?뚮┝???놁뼱??/p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map((n, i) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.LIKE
              const src = avatarSrc(n.actorProfileImage)
              return (
                <div
                  key={n.id}
                  className="notif-item"
                  onClick={async () => {
                    setSelected(n)
                    setSelectedArtImageUrl(null)
                    if (n.artworkId) {
                      try {
                        const art = await getArtwork(n.artworkId)
                        setSelectedArtImageUrl(art.imageUrl)
                      } catch {}
                    }
                  }}
                  style={{
                    ...s.item,
                    opacity: n.isRead ? 0.72 : 1,
                    animation: `fadeUp ${0.3 + i * 0.04}s ease both`,
                  }}
                >
                  {/* ?꾨컮? */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ ...s.avatar, background: meta.bg, color: meta.color }}>
                      {src
                        ? <img src={src} alt={n.actorNickname} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : <span style={{ fontSize: 16, fontWeight: 800 }}>{n.actorNickname.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <div style={{ ...s.typeIcon, background: meta.bg, color: meta.color }}>{meta.icon}</div>
                  </div>

                  {/* ?댁슜 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.itemMsg}>
                      <span style={s.actorName}>{n.actorNickname}</span>
                      {n.type === 'LIKE' && <> ?섏씠 ??洹몃┝ <span style={s.artworkName}>"{n.artworkTitle}"</span>??醫뗭븘?댁슂</>}
                      {n.type === 'FOLLOW' && <> ?섏씠 ?섎? ?붾줈?고븯湲??쒖옉?덉뼱??/>}
                      {n.type === 'FINISHED' && <> ?섍낵 ?④퍡 洹몃┛ <span style={s.artworkName}>"{n.artworkTitle}"</span>???꾩꽦?먯뼱??/>}
                    {n.type === 'INQUIRY_REPLY' && <> 臾몄쓽 <span style={s.artworkName}>"{n.message}"</span>???듬????깅줉?먯뼱??/>}
                    </p>
                    <p style={s.itemTime}>{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* 諭껋? + ?쎌쓬 + ??젣 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ ...s.badge, background: meta.bg, color: meta.color }}>{meta.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {!n.isRead && <div style={s.unreadDot} />}
                      <button
                        className="notif-del"
                        onClick={e => {
                          e.stopPropagation()
                          deleteNotification(n.id).then(() =>
                            setNotifications(prev => prev.filter(x => x.id !== n.id))
                          )
                        }}
                        style={s.delBtn}
                      >
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ?곸꽭 紐⑤떖 */}
      {selected && (() => {
        const meta = TYPE_META[selected.type] ?? TYPE_META.LIKE
        const src = avatarSrc(selected.actorProfileImage)
        const artSrc = selectedArtImageUrl
        return (
          <div style={s.overlay} onClick={() => { setSelected(null); setSelectedArtImageUrl(null); }}>
            <div style={s.modal} className="notif-modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <span style={{ ...s.badge, background: meta.bg, color: meta.color, fontSize: 12 }}>{meta.label}</span>
                <button onClick={() => { setSelected(null); setSelectedArtImageUrl(null); }} style={s.modalClose}>??/button>
              </div>

              {/* 鍮꾩＜??*/}
              <div style={s.visual}>
                {artSrc && (
                  <div style={s.artThumb}>
                    <img src={artSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ ...s.profileThumb, border: `3px solid ${meta.color}` }}>
                  {src
                    ? <img src={src} alt={selected.actorNickname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 20, fontWeight: 800, color: meta.color }}>{selected.actorNickname.charAt(0).toUpperCase()}</span>
                  }
                </div>
              </div>

              {/* 硫붿떆吏 */}
              <h3 style={s.modalTitle}>
                {selected.type === 'LIKE' && `${selected.actorNickname} ?섏씠 ??洹몃┝??醫뗭븘?댁슂`}
                {selected.type === 'FOLLOW' && `${selected.actorNickname} ?섏씠 ?붾줈?고뻽?댁슂`}
                {selected.type === 'FINISHED' && `媛숈씠 洹몃┛ 洹몃┝???꾩꽦?먯뼱??}
                {selected.type === 'INQUIRY_REPLY' && `臾몄쓽 ?듬????꾩갑?덉뼱??}
              </h3>
              <p style={s.modalDesc}>
                {selected.type === 'LIKE' && '??洹몃┝???꾧뎔媛??留덉쓬???곕쑜?섍쾶 留뚮뱾?덉뼱??'}
                {selected.type === 'FOLLOW' && '?쒕줈??洹몃┝?????먯＜ 蹂????덇쾶 ?섏뿀?댁슂.'}
                {selected.type === 'FINISHED' && '吏湲?諛붾줈 ?꾩꽦??洹몃┝???뺤씤??蹂댁꽭??'}
                {selected.type === 'INQUIRY_REPLY' && `"${selected.message}" 臾몄쓽??愿由ъ옄媛 ?듬????④꼈?댁슂.`}
              </p>
              <p style={{ fontSize: 12, color: '#b0b8c8', marginBottom: 20 }}>{timeAgo(selected.createdAt)}</p>

              {/* 踰꾪듉 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(selected.type === 'LIKE' || selected.type === 'FINISHED') && (
                  <button onClick={goToDetail} style={s.modalPrimaryBtn}>洹몃┝ 蹂대윭 媛湲?/button>
                )}
                {selected.type === 'FOLLOW' && (
                  <button onClick={goToDetail} style={s.modalPrimaryBtn}>?꾨줈??蹂대윭 媛湲?/button>
                )}
                {selected.type === 'INQUIRY_REPLY' && (
                  <button onClick={() => { navigate('/contact'); setSelected(null); setSelectedArtImageUrl(null); }} style={s.modalPrimaryBtn}>臾몄쓽 ?댁뿭 ?뺤씤?섍린</button>
                )}
                {selected.type !== 'INQUIRY_REPLY' && (
                  <button onClick={goToProfile} style={s.modalSecondaryBtn}>
                    {selected.actorNickname} ???꾨줈??                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ?꾨줈媛湲?*/}
      <button
        className="notif-top"
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
  avatar: {
    width: 46, height: 46, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  typeIcon: {
    position: 'absolute', bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid white',
  },
  itemMsg: { fontSize: 14, color: '#3d3d5c', margin: '0 0 4px', lineHeight: 1.5 },
  actorName: { fontWeight: 700 },
  artworkName: { fontWeight: 700, color: '#c47a8a' },
  itemTime: { fontSize: 12, color: '#9ca3af', margin: 0 },
  badge: {
    fontSize: 11, fontWeight: 700, padding: '3px 8px',
    borderRadius: 6, whiteSpace: 'nowrap' as const,
  },
  delAllBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '7px 14px', borderRadius: 8,
    background: 'none', border: '1.5px solid rgba(224,90,106,0.25)',
    color: '#c4b8c8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.15s',
  },
  delBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 24, height: 24, borderRadius: '50%',
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#c4b8c8', transition: 'all 0.15s',
  },
  unreadDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#c47a8a', boxShadow: '0 0 6px rgba(196,122,138,0.5)',
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
  },
  modalClose: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 18, color: '#9ca3af', padding: 4, lineHeight: 1,
  },
  visual: {
    position: 'relative', display: 'flex', justifyContent: 'center',
    alignItems: 'center', height: 160, marginBottom: 24,
  },
  artThumb: {
    width: 160, height: 140, borderRadius: 16,
    overflow: 'hidden', border: '3px solid white',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  },
  profileThumb: {
    position: 'absolute', bottom: -4, right: 'calc(50% - 80px)',
    width: 52, height: 52, borderRadius: '50%',
    overflow: 'hidden', background: 'rgba(107,130,160,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  modalTitle: { fontSize: 18, fontWeight: 800, color: '#3d3d5c', margin: '0 0 8px' },
  modalDesc: { fontSize: 14, color: '#8a94a8', margin: '0 0 8px', lineHeight: 1.6 },
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
