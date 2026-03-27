import { useEffect, useState, useRef } from 'react'
import { getUserArtworks, getMe } from '../api/user'
import type { ArtworkResponse } from '../types'
import { Link } from 'react-router-dom'
import ArtworkCard from './ArtworkCard'
import { deleteArtwork, toggleLikeArtwork } from '../api/artwork'

const Gallery = () => {
  const [artworks, setArtworks] = useState<ArtworkResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'public' | 'private'>('all')
  const sliderRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const pausedRef = useRef(false)

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const [_, artworkData] = await Promise.all([
          getMe(),
          getUserArtworks('me')
        ])
        setArtworks(artworkData)
      } catch (error) {
        console.error('Failed to fetch gallery data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGalleryData()
  }, [])

  useEffect(() => {
    if (artworks.length === 0) return
    const el = sliderRef.current
    if (!el) return
    
    const timer = setTimeout(() => {
      const speed = 0.6
      const scroll = () => {
        if (!pausedRef.current && el) {
          el.scrollLeft += speed
          if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0
        }
        animRef.current = requestAnimationFrame(scroll)
      }
      animRef.current = requestAnimationFrame(scroll)
    }, 100)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(animRef.current)
    }
  }, [artworks])

  const filteredArtworks = artworks.filter(a => {
    if (activeTab === 'public') return a.isPublic
    if (activeTab === 'private') return !a.isPublic
    return true
  })

  const handleDelete = async (artworkId: string) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) return
    try {
      await deleteArtwork(artworkId)
      setArtworks(artworks.filter(a => a.id !== artworkId))
    } catch (error) {
      console.error('Failed to delete artwork:', error)
      alert('Failed to delete artwork.')
    }
  }
  
  const handleLike = async (id: string) => {
    try {
      await toggleLikeArtwork(id)
      setArtworks((prev: ArtworkResponse[]) => prev.map((art: ArtworkResponse) => {
        if (art.id === id) {
          const isLiked = !art.isLiked
          return {
            ...art,
            isLiked,
            likeCount: isLiked ? (art.likeCount || 0) + 1 : Math.max(0, (art.likeCount || 0) - 1)
          }
        }
        return art
      }))
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  // 무한 스크롤을 위해 아이템 반복 생성
  const getDisplayItems = () => {
    if (artworks.length === 0) return []
    const minWidth = window.innerWidth + 600
    const approxItemWidth = 280 
    const repeatCount = Math.max(1, Math.ceil(minWidth / (artworks.length * approxItemWidth)))
    const oneSet = Array(repeatCount).fill(artworks).flat()
    return [...oneSet, ...oneSet]
  }
  const items = getDisplayItems()

  if (loading) return <div className="loading-state">Loading your gallery...</div>

  return (
    <div className="layout-container gallery-page">
      <header className="section-header premium-hero" style={{ background: 'var(--gradient-candy)', border: 'none' }}>
        <h1 className="section-title">나의 캔버스 🎨</h1>
        <p className="section-subtitle" style={{ color: 'var(--text-h)', opacity: 0.8 }}>나만의 소중한 상상력으로 그린 그림들을 모아왔어요!</p>
        <div className="mt-8">
          <Link to="/profile/edit" className="secondary-button">프로필 꾸미기 ✨</Link>
        </div>
      </header>

      {/* 폴라로이드 티커 섹션 추가 */}
      {artworks.length > 0 && (
        <section style={{ marginBottom: '60px' }}>
          <div style={{ padding: '0 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span className="stat-pill" style={{ background: 'var(--team-yellow)', color: 'var(--text-h)', width: 'fit-content' }}>추억 상자 🎞️</span>
              <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text)', fontWeight: 600 }}>사진첩을 넘기듯 소중한 그림들을 감상해보세요</p>
            </div>
          </div>
          
          <div style={{ position: 'relative', overflow: 'hidden', padding: '20px 0' }}>
            <style>{`
              @media (max-width: 640px) { .gallery-slider { padding: 16px 20px !important; gap: 20px !important; } }
              @media (min-width: 641px) and (max-width: 860px) { .gallery-slider { padding: 16px 40px !important; } }
            `}</style>
            <div
              ref={sliderRef}
              className="gallery-slider"
              style={{
                display: 'flex',
                gap: '40px',
                overflowX: 'hidden',
                padding: '20px 100px',
                scrollBehavior: 'auto'
              }}
              onMouseEnter={() => { pausedRef.current = true }}
              onMouseLeave={() => { pausedRef.current = false }}
            >
              {items.map((artwork, i) => (
                <div key={`${artwork.id}-${i}`} style={{ 
                  width: 240, 
                  flexShrink: 0,
                  transform: `rotate(${(Math.sin(i) * 3).toFixed(1)}deg)`,
                  marginTop: i % 2 === 0 ? '12px' : '-12px',
                  transition: 'transform 0.3s'
                }}>
                  <ArtworkCard artwork={artwork} onLike={handleLike} variant="polaroid" />
                </div>
              ))}
            </div>
            {/* 페이드 마스크 */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '100%', background: 'linear-gradient(to right, var(--bg) 0%, transparent 100%)', zIndex: 5, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100%', background: 'linear-gradient(to left, var(--bg) 0%, transparent 100%)', zIndex: 5, pointerEvents: 'none' }} />
          </div>
        </section>
      )}

      <div className="gallery-tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          모든 그림
        </button>
        <button
          className={`tab ${activeTab === 'public' ? 'active' : ''}`}
          onClick={() => setActiveTab('public')}
        >
          모두가 봐요 👀
        </button>
        <button
          className={`tab ${activeTab === 'private' ? 'active' : ''}`}
          onClick={() => setActiveTab('private')}
        >
          나만 볼래 🔒
        </button>
      </div>

      <div className="artwork-grid">
        <Link to="/canvas" className="create-new-card" style={{ background: 'var(--team-yellow)', border: '2px dashed var(--accent)', color: 'var(--text-h)', minHeight: '320px', borderRadius: '4px' }}>
          <span className="plus-icon" style={{ fontSize: '64px' }}>🐣</span>
          <span style={{ fontWeight: 800 }}>새로운 상상을 그려볼까요?</span>
          <p className="text-xs text-accent font-bold">하얀 캔버스가 기다리고 있어요!</p>
        </Link>

        {filteredArtworks.map((artwork, idx) => (
          <div key={artwork.id} className="relative group" style={{
            transform: `rotate(${((idx % 4) - 1.5) * 0.8}deg)`,
            transition: 'transform 0.3s'
          }}>
            <ArtworkCard artwork={artwork} onLike={handleLike} variant="polaroid" />
            <div className="artwork-actions glass-actions">
              <button
                onClick={() => handleDelete(artwork.id)}
                className="action-button-delete"
              >
                지우기
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="infinite-scroll-loader">
        {filteredArtworks.length > 0 ? (
          <p className="text-sm font-bold text-gray-300 mt-8 mb-4">내 소중한 그림들을 모두 모아봤어요! ✨</p>
        ) : activeTab !== 'all' && (
          <div className="text-center py-20 opacity-50">
            <div className="text-5xl mb-4">☁️</div>
            <p className="font-bold">여기는 아직 텅 비어있네요!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Gallery
