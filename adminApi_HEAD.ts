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
    todaySales: number;
    topArtworks: ArtworkStat[];
}

export interface WeeklyStat {
    date: string;
    count: number;
    value?: number; // UI ?명솚?깆쓣 ?꾪빐 異붽?
}

/**
 * ?렓 硫붿씤 諛곕꼫 ?대?吏 ?묐떟 ??? */
export interface MainBannerResponse {
    slotNumber: number;
    artworkId: string;
    artworkTitle: string;
    imageUrl: string;
}

/**
 * ?뼹截??대뱶誘쇱슜 ?묓뭹 ?묐떟 ??? */
export interface AdminArtworkResponse {
    id: string;
    title: string;
    imageUrl: string;
    nickname: string;
    createdAt: string;
    isVisible: boolean;
}

/**
 * ?뮠 臾몄쓽 ?댁뿭 ?묐떟 ??? */
export interface AdminInquiryResponse {
    id: string;
    title: string;
    content: string;
    status: string;
    createdAt: string;
    userNickname: string;
}

/**
 * ?뱤 ??쒕낫???듦퀎 ?ㅼ떆媛??곗씠??議고쉶
 */
export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
    const res = await client.get('/admin/dashboard/stats');
    return res.data;
};

/**
 * ?뱢 二쇨컙 ?꾪듃?뚰겕 ?앹꽦 ?듦퀎 (??쒕낫??李⑦듃??
 */
export const getAdminWeeklyStats = async (): Promise<WeeklyStat[]> => {
    const res = await client.get('/admin/stats/artwork-by-date');
    return res.data.map((item: { count: number }) => ({
        ...item,
        value: item.count
    }));
};

/**
 * ?첌 ?좏겙 吏湲?濡쒓렇 議고쉶
 */
export const getTokenLogs = async () => {
    const res = await client.get('/admin/tokens/logs');
    return res.data;
};

/**
 * ?뫁 ?꾩껜 ?좎? 紐⑸줉 議고쉶
 */
export const getAllAdminUsers = async () => {
    const res = await client.get('/admin/users/all');
    return res.data;
};

/**
 * ?뵇 ?좎? 寃??(?됰꽕??or ?대찓??
 */
export const searchAdminUser = async (keyword: string) => {
    const res = await client.get('/admin/users/search', { params: { keyword } });
    return res.data;
};

/**
 * ?슟 ?좎? ?쒖꽦/?뺤? ?좉?
 */
export const toggleUserStatus = async (userId: string) => {
    const res = await client.patch(`/admin/users/${userId}/status`);
    return res.data;
};

/**
 * ?뮥 ?섎룞 ?좏겙 吏湲? */
export const giveManualToken = async (userId: string, amount: number, reason: string) => {
    const res = await client.post('/admin/tokens/manual', { userId, amount, reason });
    return res.data;
};

/**
 * ?렓 硫붿씤 諛곕꼫 ?대?吏 ?뺣낫 議고쉶
 */
export const getAdminMainImages = async (): Promise<MainBannerResponse[]> => {
    const res = await client.get('/admin/main-images');
    return res.data;
};

/**
 * ?뼹截?硫붿씤 諛곕꼫 ?щ’ ?좊떦
 */
export const assignMainImage = async (artworkId: string, slotNumber: number) => {
    const res = await client.post('/admin/main-images/assign', { artworkId, slotNumber });
    return res.data;
};

/**
 * ?뮠 ?꾩껜 臾몄쓽 ?댁뿭 議고쉶 (?섏씠吏?& 寃??異붽?)
 */
export const getAdminInquiries = async (page = 0, size = 10, status = 'all', keyword = '') => {
    const res = await client.get('/admin/inquiries', {
        params: { page, size, status, keyword }
    });
    return res.data;
};

/**
 * ?뱷 臾몄쓽 ?듬? ?깅줉 (?붾뱶?ъ씤??寃쎈줈 ?섏젙: answer -> reply)
 */
export const submitInquiryAnswer = async (id: string, reply: string) => {
    const res = await client.post(`/admin/inquiries/${id}/reply`, { reply });
    return res.data;
};

/**
 * ?썳截??좉퀬???묓뭹 紐⑸줉 議고쉶 (?섏씠吏?& 寃??異붽?)
 */
export const getAdminReportedArtworks = async (page = 0, size = 10, status = 'all', keyword = '') => {
    const res = await client.get('/admin/reports', {
        params: { page, size, status, keyword }
    });
    return res.data;
};

/**
 * ?몓截??묓뭹 ?몄텧 ?곹깭 ?좉?
 */
export const toggleArtworkVisibility = async (artworkId: string) => {
    const res = await client.patch(`/admin/artworks/${artworkId}/visibility`);
    return res.data;
};

/**
 * ?뮫 寃곗젣 ?댁뿭 議고쉶 (?대뱶誘?- ?섏씠吏?& 寃??異붽?)
 */
export const getAdminPayments = async (page = 0, size = 10, keyword = '') => {
    const res = await client.get('/admin/payments', {
        params: { page, size, keyword }
    });
    return res.data;
};

/**
 * ?렓 ?꾩껜 ?묓뭹 紐⑸줉 議고쉶 (?대뱶誘??쇱씠釉뚮윭由ъ슜)
 */
export const getArtworks = async (page = 0, size = 20): Promise<{ content: AdminArtworkResponse[], totalElements: number }> => {
    const res = await client.get('/admin/artwork-all-list', {
        params: { page, size }
    });
    return res.data;
};
