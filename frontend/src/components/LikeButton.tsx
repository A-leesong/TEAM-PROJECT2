import React, { useState, useCallback } from 'react'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  isLiked: boolean
  likeCount: number
  onToggle: () => void
  disabled?: boolean
  variant?: 'default' | 'slim'
}

const LikeButton: React.FC<LikeButtonProps> = ({ isLiked, likeCount, onToggle, disabled, variant = 'default' }) => {
  const [isAnimating, setIsAnimating] = useState(false)

  const triggerBurst = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLiked) return // 이미 좋아요 상태면 버스트 효과 제외 (취소 시에는 조용히)

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // 입자 생성 (하트 기호들)
    const heartSymbols = ['❤️', '💖', '💕', '💗', '✨']
    const container = e.currentTarget

    for (let i = 0; i < 12; i++) {
        const span = document.createElement('span')
        span.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)]
        
        // 랜덤 방향 및 거리 계산
        const angle = (Math.random() * 360) * (Math.PI / 180)
        const velocity = 40 + Math.random() * 60
        const tx = Math.cos(angle) * velocity
        const ty = Math.sin(angle) * velocity
        const rotation = (Math.random() - 0.5) * 60

        span.style.cssText = `
            position: absolute;
            left: ${centerX}px;
            top: ${centerY}px;
            font-size: ${14 + Math.random() * 10}px;
            pointer-events: none;
            user-select: none;
            z-index: 10;
            --tx: ${tx}px;
            --ty: ${ty}px;
            --tr: ${rotation}deg;
            animation: heart-burst ${0.6 + Math.random() * 0.4}s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        `
        container.appendChild(span)
        setTimeout(() => span.remove(), 1000)
    }
  }, [isLiked])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return

    // 소리 없이 시각적 효과만 트리거
    if (!isLiked) {
        triggerBurst(e)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 500)
    }

    onToggle()
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`like-button-wrapper ${isLiked ? 'liked' : ''} ${isAnimating ? 'animating' : ''} ${variant}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: variant === 'slim' ? '4px' : '8px',
        padding: variant === 'slim' ? '6px 10px' : '12px 18px',
        borderRadius: variant === 'slim' ? '12px' : '16px',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: variant === 'slim' ? '12px' : '15px',
        fontWeight: 700,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        background: variant === 'slim' 
            ? (isLiked ? 'rgba(255, 92, 141, 0.15)' : 'rgba(107, 130, 160, 0.1)')
            : (isLiked 
                ? 'linear-gradient(135deg, #ff5c8d, #ff85a1)' 
                : 'linear-gradient(135deg, #6B82A0, #8ba0c0)'),
        color: variant === 'slim' 
            ? (isLiked ? '#ff5c8d' : '#6B82A0')
            : '#fff',
        boxShadow: variant === 'slim' ? 'none' : (isLiked 
            ? '0 4px 15px rgba(255, 92, 141, 0.35)' 
            : '0 4px 15px rgba(107, 130, 160, 0.25)'),
        outline: 'none',
        overflow: 'visible',
      }}
    >
      <Heart 
        size={variant === 'slim' ? 16 : 20} 
        fill={isLiked ? (variant === 'slim' ? "#ff5c8d" : "white") : "transparent"} 
        strokeWidth={2.5}
        style={{
            transform: isAnimating ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.2s',
        }}
      />
      {variant !== 'slim' && <span>{isLiked ? '좋아요!' : '응원하기'}</span>}
      <span style={{ 
          fontSize: variant === 'slim' ? '11px' : '13px', 
          opacity: 0.9, 
          marginLeft: '2px',
          background: variant === 'slim' ? 'transparent' : 'rgba(255,255,255,0.2)',
          padding: variant === 'slim' ? '0' : '2px 8px',
          borderRadius: '10px'
      }}>
          {likeCount}
      </span>
    </button>
  )
}

export default LikeButton
