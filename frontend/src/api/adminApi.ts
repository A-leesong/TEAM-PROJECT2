import client from './client';

export interface ArtworkStat {
    artworkId: string;
    title: string;
    author: string;
    likeCount: number;
    imageUrl: string;
}

export interface AdminDashboardStats {
    totalUsers: number;
    activeArtworks: number;
    pendingInquiries: number;
    totalSales: number;
    todaySales: number;
    topArtworks: ArtworkStat[];
}

export interface WeeklyStat {
    date: string;
    count: number;
    value?: number; // UI 호환성을 위해 추가
}

/**
 * 🎨 메인 배너 이미지 응답 타입
 */
export interface MainBannerResponse {
    slotNumber: number;
    artworkId: string;
    artworkTitle: string;
    imageUrl: string;
}

/**
 * 🖼️ 어드민용 작품 응답 타입
 */
export interface AdminArtworkResponse {
    id: string;
    title: string;
    imageUrl: string;
    nickname: string;
    createdAt: string;
    isVisible: boolean;
    likeCount: number;
}

/**
 * 💬 문의 내역 응답 타입
 */
export interface AdminInquiryResponse {
    id: string;
    title: string;
    content: string;
    status: string;
    createdAt: string;
    userNickname: string;
}

/**
 * 📊 대시보드 통계 실시간 데이터 조회
 */
export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
    const res = await client.get('/admin/dashboard/stats');
    return res.data;
};

/**
 * 📈 주간 아트워크 생성 통계 (대시보드 차트용)
 */
export const getAdminWeeklyStats = async (): Promise<WeeklyStat[]> => {
    const res = await client.get('/admin/stats/artwork-by-date');
    return res.data.map((item: { count: number }) => ({
        ...item,
        value: item.count
    }));
};

/**
 * 👥 날짜별 신규 가입자 수 (사용자 증가 추이 차트)
 */
export const getAdminUserByDate = async (): Promise<WeeklyStat[]> => {
    const res = await client.get('/admin/stats/user-by-date');
    return res.data.map((item: { date: string; count: number }) => ({
        date: item.date,
        count: item.count,
        value: item.count,
    }));
};

/**
 * 💰 날짜별 수익 집계 (수익 추이 차트)
 */
export const getAdminRevenueByDate = async (): Promise<WeeklyStat[]> => {
    const res = await client.get('/admin/stats/revenue-by-date');
    return res.data.map((item: { date: string; amount: number }) => ({
        date: item.date,
        count: item.amount,
        value: item.amount,
    }));
};

/**
 * 🪙 토큰 지급 로그 조회
 */
export const getTokenLogs = async () => {
    const res = await client.get('/admin/tokens/logs');
    return res.data;
};

/**
 * 👥 전체 유저 목록 조회
 */
export const getAllAdminUsers = async () => {
    const res = await client.get('/admin/users/all');
    return res.data;
};

/**
 * 🔍 유저 검색 (닉네임 or 이메일)
 */
export const searchAdminUser = async (keyword: string) => {
    const res = await client.get('/admin/users/search', { params: { keyword } });
    return res.data;
};

/**
 * 🚫 유저 활성/정지 토글
 */
export const toggleUserStatus = async (userId: string) => {
    const res = await client.patch(`/admin/users/${userId}/status`);
    return res.data;
};

/**
 * 💰 수동 토큰 지급
 */
export const giveManualToken = async (userId: string, amount: number, reason: string) => {
    const res = await client.post('/admin/tokens/manual', { userId, amount, reason });
    return res.data;
};

/**
 * 🎨 메인 배너 이미지 정보 조회
 */
export const getAdminMainImages = async (): Promise<MainBannerResponse[]> => {
    const res = await client.get('/admin/main-images');
    return res.data;
};

/**
 * 🖼️ 메인 배너 슬롯 할당
 */
export const assignMainImage = async (artworkId: string, slotNumber: number) => {
    const res = await client.post('/admin/main-images/assign', { artworkId, slotNumber });
    return res.data;
};

export const clearMainImageSlot = async (slotNumber: number) => {
    const res = await client.delete(`/admin/main-images/${slotNumber}`);
    return res.data;
};

/**
 * 💬 전체 문의 내역 조회 (페이징 & 검색 추가)
 */
export const getAdminInquiries = async (page = 0, size = 10, status = 'all', keyword = '') => {
    const params: Record<string, string | number> = { page, size, status };
    if (keyword.trim()) params.keyword = keyword.trim();
    const res = await client.get('/admin/inquiries', { params });
    return res.data;
};

/**
 * 📝 문의 답변 등록 (엔드포인트 경로 수정: answer -> reply)
 */
export const submitInquiryAnswer = async (id: string, reply: string) => {
    const res = await client.post(`/admin/inquiries/${id}/reply`, { reply });
    return res.data;
};

/**
 * 🛡️ 신고된 작품 목록 조회 (페이징 & 검색 추가)
 */
export const getAdminReportedArtworks = async (page = 0, size = 10, status = 'all', keyword = '') => {
    const res = await client.get('/admin/reports', {
        params: { page, size, status, keyword }
    });
    return res.data;
};

/**
 * ✅ 신고 처리완료
 */
export const resolveReport = async (reportId: string) => {
    const res = await client.patch(`/admin/reports/${reportId}/resolve`);
    return res.data;
};

/**
 * 👁️ 작품 노출 상태 토글
 */
export const toggleArtworkVisibility = async (artworkId: string) => {
    const res = await client.patch(`/admin/artworks/${artworkId}/visibility`);
    return res.data;
};

/**
 * 💵 결제 내역 조회 (어드민 - 페이징 & 검색 추가)
 */
export const getAdminPayments = async (page = 0, size = 10, keyword = '', from = '', to = '') => {
    const params: Record<string, string | number> = { page, size };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await client.get('/admin/payments', { params });
    return res.data;
};

export const getPaymentStats = async (from: string, to: string): Promise<{ total: number }> => {
    const res = await client.get('/admin/payments/stats', { params: { from, to } });
    return res.data;
};

/**
 * 🗑️ 작품 삭제 (어드민)
 */
export const deleteAdminArtwork = async (artworkId: string) => {
    const res = await client.delete(`/admin/artworks/${artworkId}`);
    return res.data;
};

/**
 * 📋 내 문의 내역 조회
 */
export const getMyInquiries = async (): Promise<any[]> => {
    const res = await client.get('/inquiries/my');
    return res.data;
};

/**
 * 🎨 전체 작품 목록 조회 (어드민 라이브러리용)
 */
export const getArtworks = async (page = 0, size = 20): Promise<{ content: AdminArtworkResponse[], totalElements: number }> => {
    const res = await client.get('/admin/artwork-all-list', {
        params: { page, size }
    });
    return res.data;
};
