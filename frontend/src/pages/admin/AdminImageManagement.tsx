import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const DEFAULT_SLOTS = 10;
const MAX_SLOTS = 15;

interface ArtworkItem {
    id: string;
    imageUrl: string;
    title?: string;
    userNickname?: string;
}

const AdminImageManagement = () => {
    const [slotCount, setSlotCount] = useState<number>(() => {
        const saved = localStorage.getItem('admin_main_slot_count');
        return saved ? Number(saved) : DEFAULT_SLOTS;
    });

    const [images, setImages] = useState<(string | null)[]>(() => {
        try {
            const saved = localStorage.getItem('admin_main_images');
            return saved ? JSON.parse(saved) : Array(DEFAULT_SLOTS).fill(null);
        } catch {
            return Array(DEFAULT_SLOTS).fill(null);
        }
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [targetIndex, setTargetIndex] = useState<number | null>(null);

    // 유저 그림 모달
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<number | null>(null);
    const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
    const [pickerLoading, setPickerLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem('admin_main_images', JSON.stringify(images));
    }, [images]);

    useEffect(() => {
        localStorage.setItem('admin_main_slot_count', String(slotCount));
    }, [slotCount]);

    const handleAddSlot = () => {
        if (slotCount >= MAX_SLOTS) return;
        setSlotCount(c => c + 1);
        setImages(prev => [...prev, null]);
    };

    const handleRegisterClick = (index: number) => {
        setTargetIndex(index);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || targetIndex === null) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImages(prev => {
                const updated = [...prev];
                updated[targetIndex] = reader.result as string;
                return updated;
            });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleDelete = (index: number) => {
        if (!window.confirm(`슬롯 ${index + 1}번 이미지를 삭제할까요?`)) return;
        setImages(prev => {
            const updated = [...prev];
            updated[index] = null;
            return updated;
        });
    };

    const handleOpenPicker = async (index: number) => {
        setPickerTarget(index);
        setPickerOpen(true);
        if (artworks.length > 0) return;
        setPickerLoading(true);
        try {
            const res = await axios.get('/api/artworks/explore', { params: { sort: 'latest', limit: 50 } });
            setArtworks(res.data.filter((a: ArtworkItem) => a.imageUrl));
        } catch {
            alert('유저 그림을 불러오는데 실패했습니다.');
        } finally {
            setPickerLoading(false);
        }
    };

    const handlePickArtwork = (imageUrl: string) => {
        if (pickerTarget === null) return;
        setImages(prev => {
            const updated = [...prev];
            updated[pickerTarget] = imageUrl;
            return updated;
        });
        setPickerOpen(false);
        setPickerTarget(null);
    };

    const registeredCount = images.slice(0, slotCount).filter(Boolean).length;

    return (
        <div style={s.container}>
            <header style={s.header}>
                <div>
                    <h1 style={s.title}>메인 이미지 관리</h1>
                    <p style={s.meta}>메인 화면 캐러셀에 표시될 이미지를 관리합니다.</p>
                </div>
                <div style={s.countBadge}>
                    <span style={s.countNum}>{registeredCount}</span>
                    <span style={s.countLabel}>/ {MAX_SLOTS} 등록됨</span>
                </div>
            </header>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <div style={s.grid}>
                {images.slice(0, slotCount).map((img, i) => (
                    <div key={i} style={s.card}>
                        <div style={s.slotNumber}>{i + 1}</div>

                        {/* 이미지 미리보기 영역 */}
                        <div style={s.imageArea}>
                            {img ? (
                                <img src={img} alt={`슬롯 ${i + 1}`} style={s.image} />
                            ) : (
                                <div style={s.placeholder}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                    <span style={s.placeholderText}>이미지 없음</span>
                                </div>
                            )}
                        </div>

                        {/* 버튼 영역 */}
                        <div style={s.btnGroup}>
                            <button style={s.btnRegister} onClick={() => handleRegisterClick(i)}>
                                {img ? '교체' : '등록'}
                            </button>
                            <button
                                style={{ ...s.btnDelete, opacity: img ? 1 : 0.35, cursor: img ? 'pointer' : 'default' }}
                                onClick={() => img && handleDelete(i)}
                                disabled={!img}
                            >
                                삭제
                            </button>
                        </div>
                        <button style={s.btnPicker} onClick={() => handleOpenPicker(i)}>
                            🎨 유저 그림 불러오기
                        </button>
                    </div>
                ))}
            </div>

            {/* 유저 그림 선택 모달 */}
            {pickerOpen && (
                <div style={s.modalOverlay} onClick={() => setPickerOpen(false)}>
                    <div style={s.modalBox} onClick={e => e.stopPropagation()}>
                        <div style={s.modalHeader}>
                            <h3 style={s.modalTitle}>🎨 유저 그림 선택</h3>
                            <button style={s.modalClose} onClick={() => setPickerOpen(false)}>✕</button>
                        </div>
                        {pickerLoading ? (
                            <div style={s.modalEmpty}>불러오는 중...</div>
                        ) : artworks.length === 0 ? (
                            <div style={s.modalEmpty}>등록된 작품이 없습니다.</div>
                        ) : (
                            <div style={s.artworkGrid}>
                                {artworks.map(art => (
                                    <div key={art.id} style={s.artworkThumb} onClick={() => handlePickArtwork(art.imageUrl)}>
                                        <img src={art.imageUrl} alt={art.title ?? ''} style={s.thumbImg} />
                                        <div style={s.thumbInfo}>
                                            <span style={s.thumbNick}>{art.userNickname ?? ''}</span>
                                            <span style={s.thumbTitle}>{art.title ?? '제목 없음'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 카드 추가 버튼 */}
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    style={{
                        ...s.btnAdd,
                        opacity: slotCount >= MAX_SLOTS ? 0.4 : 1,
                        cursor: slotCount >= MAX_SLOTS ? 'default' : 'pointer',
                    }}
                    onClick={handleAddSlot}
                    disabled={slotCount >= MAX_SLOTS}
                >
                    + 카드 추가
                </button>
                {slotCount >= MAX_SLOTS && (
                    <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>
                        최대 {MAX_SLOTS}개까지 등록 가능합니다.
                    </span>
                )}
                {slotCount < MAX_SLOTS && (
                    <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
                        {slotCount} / {MAX_SLOTS}개 사용 중
                    </span>
                )}
            </div>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    container: { padding: '40px' },
    header: {
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '36px',
    },
    title: { fontSize: '26px', fontWeight: 800, color: '#5B21B6', margin: '0 0 6px' },
    meta: { color: '#7C3AED', fontWeight: 500, opacity: 0.75, margin: 0, fontSize: '14px' },
    countBadge: {
        background: '#F3E8FF', border: '1.5px solid #DDD6FE',
        borderRadius: '16px', padding: '10px 20px',
        display: 'flex', alignItems: 'baseline', gap: '4px',
    },
    countNum: { fontSize: '28px', fontWeight: 900, color: '#7C3AED', lineHeight: 1 },
    countLabel: { fontSize: '14px', fontWeight: 600, color: '#9CA3AF' },

    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '20px',
    },

    card: {
        background: '#fff',
        borderRadius: '16px',
        border: '1.5px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    slotNumber: {
        position: 'absolute', top: '10px', left: '10px',
        width: '24px', height: '24px', borderRadius: '50%',
        background: 'rgba(0,0,0,0.45)', color: '#fff',
        fontSize: '11px', fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1,
    },

    imageArea: {
        width: '100%', aspectRatio: '4/3',
        overflow: 'hidden',
        background: '#F9FAFB',
    },
    image: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
    placeholder: {
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '8px',
    },
    placeholderText: { fontSize: '12px', color: '#D1D5DB', fontWeight: 500 },

    btnGroup: {
        display: 'flex', gap: '8px',
        padding: '12px',
    },
    btnRegister: {
        flex: 1, padding: '8px 0', fontSize: '13px', fontWeight: 700,
        background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
        color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer',
    },
    btnAdd: {
        padding: '12px 28px', fontSize: '14px', fontWeight: 700,
        background: '#fff', color: '#7C3AED',
        border: '2px dashed #7C3AED', borderRadius: '12px',
        display: 'flex', alignItems: 'center', gap: '6px',
    },
    btnDelete: {
        flex: 1, padding: '8px 0', fontSize: '13px', fontWeight: 700,
        background: '#FEE2E2', color: '#EF4444',
        border: '1px solid #FECACA', borderRadius: '10px', cursor: 'pointer',
    },
    btnPicker: {
        width: '100%', padding: '8px 0', fontSize: '12px', fontWeight: 700,
        background: '#EDE9FE', color: '#7C3AED',
        border: '1px solid #DDD6FE', borderRadius: '0 0 12px 12px',
        cursor: 'pointer',
    },
    modalOverlay: {
        position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modalBox: {
        background: '#fff', borderRadius: '20px', width: '720px', maxWidth: '95vw',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column' as const,
        overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    },
    modalHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 24px', borderBottom: '1px solid #F3F4F6',
    },
    modalTitle: { fontSize: '18px', fontWeight: 800, color: '#5B21B6', margin: 0 },
    modalClose: {
        background: 'none', border: 'none', fontSize: '18px', color: '#9CA3AF',
        cursor: 'pointer', padding: '4px 8px',
    },
    modalEmpty: { padding: '60px', textAlign: 'center' as const, color: '#9CA3AF', fontSize: '14px' },
    artworkGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
        padding: '20px', overflowY: 'auto' as const,
    },
    artworkThumb: {
        borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
        border: '2px solid transparent', transition: 'border-color 0.2s',
        background: '#F9FAFB',
    },
    thumbImg: { width: '100%', aspectRatio: '1', objectFit: 'cover' as const, display: 'block' },
    thumbInfo: { padding: '6px 8px' },
    thumbNick: { fontSize: '10px', color: '#9CA3AF', display: 'block' },
    thumbTitle: { fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
};

export default AdminImageManagement;
