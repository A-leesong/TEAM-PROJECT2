import { useEffect, useState, useRef } from 'react'
import { exploreArtworks } from '../api/artwork'
import type { ArtworkResponse } from '../types'
import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function Explore() {
  const [artworks, setArtworks] = useState<ArtworkResponse[]>([])
  const [loading, setLoading] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const pausedRef = useRef(false)

  useEffect(() => {
    exploreArtworks('latest', undefined, 30)
      .then(data => setArtworks(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (artworks.length === 0) return
    const el = sliderRef.current
    if (!el) return
    const speed = 0.7
    const scroll = () => {
      if (!pausedRef.current) {
        el.scrollLeft += speed
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0
      }
      animRef.current = requestAnimationFrame(scroll)
    }
    animRef.current = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(animRef.current)
  }, [artworks])

  const top3 = [...artworks].sort((a, b) => b.likeCount - a.likeCount).slice(0, 3)
  const items = artworks.length > 0 ? [...artworks, ...artworks] : []

  return (
    <div style={s.bg}>
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-60px)} }
        @keyframes blob2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(60px)} }
        @keyframes blob3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-40px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .slide-card { transition: transform 0.2s, box-shadow 0.2s; text-decoration: none; display: block; }
        .slide-card:hover { transform: translateY(-8px) scale(1.03); box-shadow: 0 12px 40px rgba(107,130,160,0.22) !important; }
      `}</style>

      <div style={s.blobs}>
        <div style={{ ...s.blob, top: '-10%', left: '-8%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(255,150,180,0.22) 0%, transparent 65%)', animation: 'blob1 7s ease-in-out infinite' }} />
        <div style={{ ...s.blob, top: '25%', right: '-10%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(107,130,160,0.18) 0%, transparent 65%)', animation: 'blob2 9s ease-in-out infinite' }} />
        <div style={{ ...s.blob, bottom: '5%', left: '20%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(255,220,80,0.15) 0%, transparent 65%)', animation: 'blob3 11s ease-in-out infinite' }} />
      </div>

      <Header />

      <main style={s.main}>
        {/* 히어로 */}
        <div style={s.hero}>
          <p style={s.eyebrow}>✦ Public Gallery</p>
          <h1 style={s.title}>갤러리 둘러보기</h1>
          <p style={s.subtitle}>친구들이 그린 멋진 그림들을 만나보세요</p>
        </div>

        {loading ? (
          <p style={{ color: '#a09ab0', textAlign: 'center', padding: '60px 0', fontSize: 15 }}>불러오는 중...</p>
        ) : artworks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ fontSize: 52, margin: '0 0 16px' }}>☁️</p>
            <p style={{ color: '#a09ab0', fontWeight: 600, margin: '0 0 24px' }}>아직 등록된 작품이 없어요</p>
            <Link to="/canvas" style={s.startBtn}>첫 번째 그림 그리기</Link>
          </div>
        ) : (
          <>
            {/* 오늘의 작품 */}
            <section style={s.section}>
              <div style={s.sectionHead}>
                <span style={s.sectionBadge}>오늘의 작품</span>
                <p style={s.sectionDesc}>좋아요를 가장 많이 받은 작품들이에요</p>
              </div>
              <div style={s.top3Grid}>
                {top3.map(artwork => (
                  <Link key={artwork.id} to={`/artwork/${artwork.id}`} className="slide-card" style={s.top3Card}>
                    <div style={s.top3ImgWrap}>
                      {artwork.imageUrl
                        ? <img src={artwork.imageUrl} alt={artwork.title || ''} style={s.img} />
                        : <div style={s.imgPlaceholder}>🎨</div>
                      }
                    </div>
                    <div style={s.cardBody}>
                      <p style={s.cardTitle}>{artwork.title || 'hi!'}</p>
                      {artwork.topic && <p style={s.cardTopic}>{artwork.topic}</p>}
                      <div style={s.cardMeta}>
                        <span style={s.creatorBadge}>{artwork.userNickname || '익명'}</span>
                        <span style={s.likeCount}>❤️ {artwork.likeCount}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* 전체 작품 슬라이더 */}
            <section style={s.section}>
              <div style={s.sectionHead}>
                <span style={s.sectionBadge}>전체 작품</span>
                <p style={s.sectionDesc}>마우스를 올리면 멈춰요 · 클릭하면 상세 페이지로</p>
              </div>

              <div style={s.sliderOuter}>
                <div
                  ref={sliderRef}
                  style={s.sliderTrack}
                  onMouseEnter={() => { pausedRef.current = true }}
                  onMouseLeave={() => { pausedRef.current = false }}
                >
                  {items.map((artwork, i) => (
                    <Link key={`${artwork.id}-${i}`} to={`/artwork/${artwork.id}`} className="slide-card" style={s.card}>
                      <div style={s.imgWrap}>
                        {artwork.userImageData || artwork.imageUrl
                          ? <img src={artwork.userImageData || artwork.imageUrl!} alt={artwork.title || ''} style={s.img} />
                          : <div style={s.imgPlaceholder}>🎨</div>
                        }
                      </div>
                      <div style={s.cardBody}>
                        <p style={s.cardTitle}>{artwork.title || 'hi!'}</p>
                        {artwork.topic && <p style={s.cardTopic}>{artwork.topic}</p>}
                        <div style={s.cardMeta}>
                          <span style={s.creatorBadge}>{artwork.userNickname || '익명'}</span>
                          <span style={s.likeCount}>❤️ {artwork.likeCount}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div style={{ ...s.fadeMask, left: 0, background: 'linear-gradient(to right, #ede8f2 0%, transparent 100%)' }} />
                <div style={{ ...s.fadeMask, right: 0, background: 'linear-gradient(to left, #ede8f2 0%, transparent 100%)' }} />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #f5f0f8 0%, #ede8f2 40%, #f0eee9 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  blobs: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 200,
    paddingBottom: 80,
    position: 'relative',
    zIndex: 1,
  },
  hero: {
    textAlign: 'center',
    marginBottom: 64,
    animation: 'fadeUp 0.6s ease both',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 3,
    color: '#c47a8a',
    textTransform: 'uppercase',
    margin: '0 0 12px',
  },
  title: {
    fontSize: 38,
    fontWeight: 900,
    margin: '0 0 12px',
    padding: '4px 0',
    fontFamily: "'Jua', sans-serif",
    background: 'linear-gradient(135deg, #c47a8a 0%, #6B82A0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: 16,
    color: '#6a6080',
    margin: 0,
  },
  section: {
    width: '100%',
    textAlign: 'center',
    marginBottom: 64,
  },
  sectionHead: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  sectionBadge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, rgba(196,122,138,0.15) 0%, rgba(107,130,160,0.15) 100%)',
    border: '1.5px solid rgba(196,122,138,0.3)',
    color: '#b06a7a',
    fontWeight: 700,
    fontSize: 13,
    borderRadius: 24,
    padding: '6px 20px',
    letterSpacing: 0.3,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#7a7090',
    margin: 0,
    fontWeight: 500,
  },
  top3Grid: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
    flexWrap: 'wrap',
    padding: '0 24px',
  },
  top3Card: {
    flexShrink: 0,
    width: 312,
    borderRadius: 20,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,240,248,0.85) 100%)',
    border: '1.5px solid rgba(255,255,255,0.75)',
    boxShadow: '0 4px 20px rgba(107,130,160,0.11)',
    overflow: 'hidden',
    color: 'inherit',
  },
  top3ImgWrap: {
    width: '100%',
    height: 234,
    background: 'linear-gradient(135deg, rgba(196,122,138,0.08), rgba(107,130,160,0.08))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sliderOuter: {
    position: 'relative',
    width: '100%',
  },
  sliderTrack: {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 20,
    overflowX: 'hidden',
    padding: '8px 60px 32px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  card: {
    flexShrink: 0,
    width: 240,
    borderRadius: 20,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,240,248,0.85) 100%)',
    border: '1.5px solid rgba(255,255,255,0.75)',
    boxShadow: '0 4px 20px rgba(107,130,160,0.11)',
    overflow: 'hidden',
    color: 'inherit',
  },
  imgWrap: {
    width: '100%',
    height: 180,
    background: 'linear-gradient(135deg, rgba(196,122,138,0.08), rgba(107,130,160,0.08))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imgPlaceholder: {
    fontSize: 48,
  },
  cardBody: {
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#4a4a6a',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardTopic: {
    fontSize: 12,
    color: '#a09ab0',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  creatorBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#6B82A0',
    background: 'rgba(107,130,160,0.1)',
    borderRadius: 20,
    padding: '2px 8px',
  },
  likeCount: {
    fontSize: 12,
    fontWeight: 600,
    color: '#c47a8a',
  },
  fadeMask: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    pointerEvents: 'none',
  },
  startBtn: {
    display: 'inline-block',
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #6B82A0, #c47a8a)',
    color: '#fff',
    borderRadius: 14,
    fontWeight: 700,
    textDecoration: 'none',
    fontSize: 14,
    boxShadow: '0 4px 20px rgba(107,130,160,0.3)',
  },
}
