package com.egag.admin.dto;

import lombok.*;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardStatsResponse {
    private long totalUsers;
    private long todayNewUsers;
    private long totalSales;
    private long todaySales;
    private long suspendedUsers;
    private long activeUsers;
    private long activeArtworks;
    private long pendingInquiries;

    private List<ArtworkStat> topArtworks;
}