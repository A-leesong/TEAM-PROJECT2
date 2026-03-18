// frontend/src/pages/Policy.tsx
import React, { useEffect, useState } from 'react';
import { getLatestTerms, getLatestPrivacy, type PolicyResponse } from '../api/policy';

interface PolicyProps {
    type: 'TERMS' | 'PRIVACY';
}

const Policy: React.FC<PolicyProps> = ({ type }) => {
    const [policy, setPolicy] = useState<PolicyResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const response = type === 'TERMS' ? await getLatestTerms() : await getLatestPrivacy();
                setPolicy(response.data);
            } catch (error) {
                console.error("정책을 불러오는데 실패했습니다.", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, [type]);

    if (loading) return <div style={s.loading}>🐣 열심히 불러오는 중...</div>;
    if (!policy) return <div style={s.loading}>🥚 아직 준비된 내용이 없어요!</div>;

    return (
        <div style={s.container}>
            <div style={s.card}>
                {/* 상단 아이콘과 제목 */}
                <div style={s.header}>
                    <span style={s.icon}>{type === 'TERMS' ? '📜' : '🔒'}</span>
                    <h1 style={s.title}>{type === 'TERMS' ? '이용약관' : '개인정보처리방침'}</h1>
                    <div style={s.meta}>
                        <span>버전 {policy.version}</span>
                        <span style={s.dot}>•</span>
                        <span>시행일 {new Date(policy.effectiveDate).toLocaleDateString()}</span>
                    </div>
                </div>

                <div style={s.divider} />

                {/* 본문 영역 */}
                <div style={s.content}>
                    {policy.content}
                </div>

                {/* 하단 귀여운 푸터 */}
                <div style={s.footer}>
                    이그에그와 함께 즐거운 창작 시간 되세요! 🥚✨
                </div>
            </div>
        </div>
    );
};

// 스타일 설정 (아기자기한 컨셉)
const s: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        // 배경: 솜사탕 우주 그라데이션 (핑크-보라-하늘)
        background: 'linear-gradient(135deg, #FDECF2 0%, #E0E7FF 50%, #F5F3FF 100%)',
        padding: '60px 20px',
        display: 'flex',
        justifyContent: 'center',
    },
    card: {
        // 배경: 살짝 투명한 유리 느낌
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        maxWidth: '800px',
        width: '100%',
        borderRadius: '40px', // 둥글게
        padding: '50px',
        // 그림자: 은은한 보랏빛
        boxShadow: '0 10px 25px rgba(165, 180, 252, 0.15)',
        border: '2px solid #FFFFFF',
        position: 'relative',
    },

    // ⭐ 요청하신 레이아웃 스타일 (색상만 변경)
    header: {
        textAlign: 'center',
        marginBottom: '50px', // 헤더와 본문 사이 간격 늘림
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px' // 요소들 사이의 기본 간격 설정
    },
    icon: {
        fontSize: '64px', // 아이콘을 조금 더 시원하게 키움
        display: 'block',
        marginBottom: '10px', // 아이콘과 제목 사이 여유
        // 아이콘에 은은한 보랏빛 광채
        filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))',
    },
    title: {
        fontSize: '32px', // 제목 크기 소폭 확대
        fontWeight: 800,
        color: '#5B21B6', // 우주 느낌 나는 진한 보라색
        margin: '10px 0', // 위아래 여백 추가
        letterSpacing: '-0.5px' // 가독성을 위해 자간 살짝 조절
    },
    meta: {
        fontSize: '15px',
        color: '#7C3AED', // 연한 보라색
        display: 'flex',
        justifyContent: 'center',
        gap: '12px', // 버전과 시행일 사이 간격 벌림
        fontWeight: 600,
        marginTop: '5px', // 제목과의 간격 추가
        opacity: 0.8
    },

    dot: { color: '#DDD6FE' }, // 구분점 색상 (연보라)
    divider: {
        height: '2px',
        background: 'linear-gradient(to right, transparent, #DDD6FE, transparent)', // 부드러운 구분선
        margin: '20px 0 40px 0',
        borderRadius: '2px',
    },
    content: {
        whiteSpace: 'pre-wrap',
        lineHeight: '1.8',
        color: '#4C1D95', // 본문 글자색 (진한 보라)
        fontSize: '16px',
        textAlign: 'left',
    },
    footer: {
        marginTop: '60px',
        textAlign: 'center',
        fontSize: '15px',
        color: '#8B5CF6',
        fontWeight: 700,
        letterSpacing: '1px',
    },
    loading: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        fontWeight: 800,
        color: '#8B5CF6',
        background: '#F5F3FF',
    }
};

export default Policy;