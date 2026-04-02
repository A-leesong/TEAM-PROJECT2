import { useState, useEffect, useCallback } from 'react';
import type { MainBannerResponse, AdminArtworkResponse } from '../../api/adminApi';
import { getAdminMainImages, getArtworks, assignMainImage } from '../../api/adminApi';

interface BannerSlot extends MainBannerResponse {
    isPlaceholder?: boolean;
}

/**
 * ?렄截?諛곕꼫 ?먮젅?댁뀡 愿由?(v5.0 - ?쒖뒪??怨좊룄??
 * - ?숈쟻 ?щ’ ???諛??꾩뿭 ?ㅽ????ㅼ뿼 諛⑹?
 * - ?곸꽭 ?먮윭 ?몃뱾留?諛??좊떦 ?쇰뱶諛?媛뺥솕
 */
const AdminImageManagement = () => {
    const [slots, setSlots] = useState<BannerSlot[]>([]);
    const [artworks, setArtworks] = useState<AdminArtworkResponse[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [assigning, setAssigning] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            // 珥덇린 濡쒕뵫 ?쒖뿉留??꾩뿭 濡쒕뵫 ?쒖떆
            if (slots.length === 0) setIsLoading(true);
            
            const [bannerData, artworkData] = await Promise.all([
                getAdminMainImages(),
                getArtworks(0, 50) 
            ]);

            // 理쒖냼 6媛??щ’? 蹂댁옣?섎릺, ?곗씠?곌? ???덉쑝硫?洹몃쭔???앹꽦
            const minSlots = 6;
            const finalSlotCount = Math.max(minSlots, ...bannerData.map(b => b.slotNumber + 1));
            
            const updatedSlots: BannerSlot[] = Array.from({ length: finalSlotCount }, (_, i) => ({
                slotNumber: i,
                artworkId: '',
                artworkTitle: '',
                imageUrl: '',
                isPlaceholder: true
            }));

            bannerData.forEach((b) => {
                if (b.slotNumber < finalSlotCount) {
                    updatedSlots[b.slotNumber] = { ...b, isPlaceholder: false };
                }
            });

            setSlots(updatedSlots);
            setArtworks(artworkData.content || []);
        } catch (err) {
            console.error("Data fetch error:", err);
            setError("?곗씠?곕? 遺덈윭?ㅻ뒗 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?좎떆 ???ㅼ떆 ?쒕룄?댁＜?몄슂.");
        } finally {
            setIsLoading(false);
        }
    }, [slots.length]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const handleAssign = async (artworkId: string) => {
        if (selectedSlot === null || assigning) return;
        try {
            setAssigning(true);
            await assignMainImage(artworkId, selectedSlot);
            await fetchData(); 
            setSelectedSlot(null);
            setTimeout(() => alert(`?щ’ #${selectedSlot + 1}???깃났?곸쑝濡?諛섏쁺?섏뿀?듬땲?? ??), 100);
        } catch (err) {
            alert("?좊떦 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?ㅼ떆 ?쒕룄?댁＜?몄슂.");
        } finally {
            setAssigning(false);
        }
    };

    if (isLoading) return <div style={s.loadingBox}>諛곕꼫 愿由??쒖뒪??以鍮?以?.. ?렄截?/div>;
    
    if (error) return (
        <div style={s.errorBox}>
            <div style={s.errorIcon}>?좑툘</div>
            <p style={s.errorMsg}>{error}</p>
            <button onClick={() => void fetchData()} style={s.retryBtn}>?ㅼ떆 ?쒕룄</button>
        </div>
    );

    return (
        <div style={s.pageContainer}>
            <div style={s.pageWrapper}>
                <header style={s.header}>
                    <div>
                        <h1 style={s.pageTitle}>諛곕꼫 吏꾩뿴 愿由?/h1>
                        <p style={s.pageSubtitle}>?덊럹?댁? 硫붿씤 諛곕꼫???щ’(Slot)蹂??꾩떆 ?묓뭹??愿由ы빀?덈떎.</p>
                    </div>
                    <div style={s.statusBadge}>?쒖뒪???덉젙??紐⑤뱶 v5.0</div>
                </header>

                <section style={s.gridSection}>
                    <div style={s.secHeader}>
                        <h2 style={s.secTitle}>Step 01. ?몄쭛???щ’ ?좏깮</h2>
                        <p style={s.secDesc}>?꾩옱 ?꾩떆 以묒씤 ?щ’?낅땲?? ?섏젙???먰븯???щ’ 移대뱶瑜??대┃?섏꽭??</p>
                    </div>

                    <div style={s.slotGrid}>
                        {slots.map((slot) => {
                            const isSelected = selectedSlot === slot.slotNumber;
                            return (
                                <div 
                                    key={`slot-${slot.slotNumber}`}
                                    onClick={() => setSelectedSlot(slot.slotNumber)}
                                    style={{
                                        ...s.slotCard,
                                        border: isSelected ? '3px solid #6366F1' : '1px solid #E2E8F0',
                                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                        boxShadow: isSelected ? '0 20px 40px rgba(99, 102, 241, 0.1)' : '0 4px 6px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    <div style={s.slotHeader}>
                                        <span style={s.slotNumBadge}>?щ’ {slot.slotNumber + 1}</span>
                                        {isSelected && <span style={s.editingBadge}>?몄쭛 以?/span>}
                                    </div>
                                    <div style={s.slotPreview}>
                                        {slot.imageUrl ? (
                                            <img src={slot.imageUrl} alt="" style={s.fullImg} />
                                        ) : (
                                            <div style={s.emptyPlaceholder}>鍮꾩뼱 ?덉쓬</div>
                                        )}
                                    </div>
                                    <div style={s.slotInfo}>
                                        <h3 style={s.slotTitle}>{slot.artworkTitle || "?깅줉???묓뭹 ?놁쓬"}</h3>
                                        <p style={s.slotStatus}>{slot.artworkId ? "?꾩옱 ?몄텧 以? : "?꾩떆???대?吏瑜??꾨옒?먯꽌 ?좏깮"}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section style={s.librarySection}>
                    {assigning && (
                        <div style={s.assigningOverlay}>
                            <div style={s.spinner}>?봽</div>
                            <p>?щ’??諛섏쁺?섎뒗 以?..</p>
                        </div>
                    )}
                    <div style={s.secHeader}>
                        <h2 style={s.secTitle}>Step 02. ?묓뭹 ?좏깮</h2>
                        <p style={s.secDesc}>?좏깮???щ’??諛붾줈 ?꾩떆???묓뭹???쇱씠釉뚮윭由ъ뿉??怨⑤씪二쇱꽭??</p>
                    </div>

                    <div style={s.libraryGrid}>
                        {artworks.map((art) => (
                            <div 
                                key={art.id} 
                                style={{
                                    ...s.artCard,
                                    opacity: assigning ? 0.6 : 1,
                                    pointerEvents: assigning ? 'none' : 'auto'
                                }} 
                                onClick={() => handleAssign(art.id)}
                            >
                                <div style={s.artImgBox}>
                                    <img src={art.imageUrl} alt="" style={s.fullImg} />
                                    <div style={s.artOverlay}>
                                        <div style={s.applyBtn}>{selectedSlot !== null ? `?щ’ ${selectedSlot + 1}??諛섏쁺` : '?щ’ 癒쇱? ?좏깮'} ??/div>
                                    </div>
                                </div>
                                <div style={s.artInfo}>
                                    <span style={s.artTitle}>{art.title}</span>
                                    <span style={s.artUser}>@{art.nickname}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <style>{`
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    pageContainer: {
        backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%'
    },
    pageWrapper: { 
        backgroundColor: 'transparent', padding: '10px 0 60px 0', color: '#1E293B',
        fontFamily: "'Inter', 'Pretendard', sans-serif", animation: 'fadeIn 0.4s ease-out'
    },
    loadingBox: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#94A3B8', backgroundColor: '#F8FAFC' },
    errorBox: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', gap: '20px' },
    errorIcon: { fontSize: '48px' },
    errorMsg: { fontSize: '16px', fontWeight: 600, color: '#EF4444' },
    retryBtn: { padding: '10px 24px', backgroundColor: '#6366F1', color: '#FFF', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' },
    pageTitle: { fontSize: '38px', fontWeight: 900, letterSpacing: '-1.5px', margin: 0, color: '#0F172A' },
    pageSubtitle: { fontSize: '15px', color: '#64748B', marginTop: '8px', fontWeight: 500 },
    statusBadge: { 
        padding: '8px 18px', borderRadius: '40px', border: '1px solid #E2E8F0', 
        fontSize: '11px', fontWeight: 900, letterSpacing: '1px', color: '#6366F1', backgroundColor: '#F5F3FF'
    },
    gridSection: { marginBottom: '80px' },
    secHeader: { marginBottom: '32px' },
    secTitle: { fontSize: '22px', fontWeight: 800, margin: '0 0 8px 0', color: '#1E293B' },
    secDesc: { fontSize: '14px', color: '#64748B', margin: 0 },
    slotGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
    slotCard: { 
        borderRadius: '24px', padding: '24px', cursor: 'pointer', backgroundColor: '#FFFFFF',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', gap: '16px'
    },
    slotHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    slotNumBadge: { fontSize: '11px', fontWeight: 900, color: '#94A3B8', letterSpacing: '1px' },
    editingBadge: { backgroundColor: '#6366F1', color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 900 },
    slotPreview: { height: '190px', borderRadius: '16px', backgroundColor: '#F1F5F9', overflow: 'hidden', border: '1px solid #E2E8F0' },
    fullImg: { width: '100%', height: '100%', objectFit: 'cover' },
    emptyPlaceholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#CBD5E1', letterSpacing: '2px' },
    slotInfo: { padding: '0 4px' },
    slotTitle: { fontSize: '17px', fontWeight: 800, color: '#1E293B', margin: '0 0 4px 0' },
    slotStatus: { fontSize: '13px', color: '#94A3B8', margin: 0 },
    librarySection: { position: 'relative', backgroundColor: '#FFFFFF', padding: '60px', borderRadius: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' },
    assigningOverlay: {
        position: 'absolute', inset: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        borderRadius: '40px', fontWeight: 800, color: '#6366F1'
    },
    spinner: { fontSize: '32px', animation: 'spin 1s linear infinite', marginBottom: '10px' },
    libraryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '28px' },
    artCard: { backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', transition: '0.3s', cursor: 'pointer' },
    artImgBox: { height: '220px', position: 'relative', overflow: 'hidden' },
    artOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(99, 102, 241, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' },
    applyBtn: { color: '#FFF', fontSize: '12px', fontWeight: 900, border: '1.5px solid #FFF', padding: '10px 20px', borderRadius: '10px' },
    artInfo: { padding: '22px' },
    artTitle: { display: 'block', fontSize: '15px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' },
    artUser: { fontSize: '12px', color: '#94A3B8', fontWeight: 600 }
};

export default AdminImageManagement;
