import React, { useState, useEffect, useMemo } from 'react';

// ── 데이터 생성 로직 ──
const generateErrorCodeStream = (count: number) => {
    const codes = ['Error 500', 'Fatal', 'Critical', '0', '1'];
    return [...Array(count)].map((_, i) => ({
        id: i,
        text: codes[Math.floor(Math.random() * codes.length)],
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        fontSize: `${14 + Math.random() * 18}px`,
        delay: `${Math.random() * 5}s`,
        duration: `${15 + Math.random() * 15}s`,
        opacity: 0.1 + Math.random() * 0.15,
    }));
};

const InternalError: React.FC = () => {
    const [shake, setShake] = useState(false);
    const [isHiding, setIsHiding] = useState(false); // 👈 사용됨!
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const errorCodeStream = useMemo(() => generateErrorCodeStream(12), []); // 👈 사용됨!

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);

        const interval = setInterval(() => {
            setShake(true);
            setIsHiding(true);
            setTimeout(() => {
                setShake(false);
                setIsHiding(false);
            }, 1500);
        }, 5000);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(interval);
        };
    }, []);

    const errorStyle = `
        @keyframes aurora {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-30px, 20px) scale(1.1); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        @keyframes codeFlow {
            0% { transform: translateY(10vh); opacity: 0; }
            50% { opacity: var(--original-opacity); }
            100% { transform: translateY(-100vh); opacity: 0; }
        }
        @keyframes sweatDrop {
            0%, 100% { transform: translateY(0); opacity: 0; }
            20%, 80% { opacity: 1; }
            50% { transform: translateY(10px); }
        }
    `;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100vh', background: '#0a0a0a', color: '#fff',
            fontFamily: "'Pretendard', sans-serif", // 👈 오타 교정 완료!
            overflow: 'hidden', position: 'relative'
        }}>
            <style>{errorStyle}</style>

            {/* 배경 오로라 */}
            <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255, 77, 77, 0.1) 0%, transparent 70%)', top: '10%', left: '10%', filter: 'blur(80px)', animation: 'aurora 10s infinite ease-in-out', zIndex: 0 }} />

            {/* 🛠️ 해결: errorCodeStream 사용 (배경 코드 흐르기) */}
            {errorCodeStream.map((code) => (
                <div key={code.id} style={{
                    position: 'absolute', top: code.top, left: code.left,
                    fontSize: code.fontSize, fontWeight: 700, color: '#ff4d4d',
                    opacity: code.opacity, zIndex: 1, pointerEvents: 'none',
                    animation: `codeFlow ${code.duration} infinite linear ${code.delay}`,
                    //@ts-ignore
                    '--original-opacity': code.opacity
                } as React.CSSProperties}>
                    {code.text}
                </div>
            ))}

            <div style={{ textAlign: 'center', zIndex: 3, animation: 'float 4s infinite ease-in-out' }}>
                <h1 style={{
                    fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: 900, color: '#ff4d4d', margin: 0,
                    textShadow: '0 0 30px rgba(255, 77, 77, 0.5)',
                    transform: shake ? 'translateX(2px) skewX(5deg)' : 'none',
                    transition: 'transform 0.1s'
                }}>500</h1>

                <div style={{
                    margin: '30px 0',
                    position: 'relative',
                    transform: `rotate(${(mousePos.x - window.innerWidth / 2) / 100}deg)`,
                    transition: 'transform 0.2s ease-out'
                }}>
                    <svg width="180" height="243" viewBox="0 0 200 270">
                        <defs><clipPath id="body-clip"><rect x="0" y="133" width="200" height="200" /></clipPath></defs>
                        <ellipse cx="100" cy="173" rx="57" ry="73" fill="#FFD700" stroke="#000" strokeWidth="1.5" clipPath="url(#body-clip)" />
                        <circle cx="80" cy="148" r="11" fill="white" stroke="#000" strokeWidth="1.5" />
                        <circle cx="80" cy="148" r="5" fill="#000" />
                        <circle cx="120" cy="148" r="11" fill="white" stroke="#000" strokeWidth="1.5" />
                        <circle cx="120" cy="148" r="5" fill="#000" />
                        <path d="M 93,161 L 107,161 L 100,172 Z" fill="#FFA500" stroke="#000" strokeWidth="1" />
                        <ellipse cx="64" cy="160" rx="8" ry="5.5" fill="#FFC0CB" />
                        <ellipse cx="136" cy="160" rx="8" ry="5.5" fill="#FFC0CB" />
                        <path d="M 30,187 L 48,170 L 65,187 L 83,170 L 100,187 L 117,170 L 135,187 L 152,170 L 170,187 C 175,222 170,255 100,258 C 30,255 25,222 30,187 Z" fill="#FFEDDC" stroke="#000" strokeWidth="1.8" />

                        {/* 🛠️ 해결: isHiding 사용 (껍데기 뚜껑 움직임) */}
                        <g style={{
                            transform: isHiding ? 'translateY(38px)' : 'translateY(0px)',
                            transition: 'transform 0.4s cubic-bezier(0.34, 1.5, 0.64, 1)',
                        }}>
                            <path d="M 30,148 L 48,131 L 65,148 L 83,131 L 100,148 L 117,131 L 135,148 L 152,131 L 170,148 C 165,102 150,72 100,68 C 50,72 35,102 30,148 Z" fill="#FFEDDC" stroke="#000" strokeWidth="1.8" />
                        </g>
                    </svg>

                    {/* 🛠️ 해결: isHiding 사용 (땀방울 애니메이션) */}
                    <div style={{
                        position: 'absolute', top: '80px', right: '10px', fontSize: '30px',
                        animation: isHiding ? 'sweatDrop 1.2s ease-in-out infinite' : 'none',
                        opacity: isHiding ? 1 : 0, transition: 'opacity 0.2s'
                    }}>💧</div>
                </div>

                <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px', color: '#fff' }}>삐약이가 과부하됐어요!</h2>
                <p style={{ color: '#ccc', fontSize: '16px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
                    서버가 너무 뜨거워져서 삐약이가 숨어버렸어요.<br />잠시 후 다시 불러와주세요!
                </p>

                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '40px', padding: '16px 45px',
                        background: 'linear-gradient(135deg, #ff4d4d 0%, #f43f5e 100%)',
                        color: '#fff', border: 'none', borderRadius: '40px', cursor: 'pointer',
                        fontWeight: 800, fontSize: '17px',
                        boxShadow: '0 10px 20px rgba(255, 77, 77, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    System Reboot 🐣
                </button>
            </div>
        </div>
    );
};

export default InternalError;