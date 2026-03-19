package com.egag.admin.dto;

import lombok.*;

@Getter
@Builder // 👈 이게 있어야 AdminController에서 .builder()를 쓸 수 있습니다!
@AllArgsConstructor // 👈 Builder를 쓰려면 이게 꼭 세트로 있어야 해요.
@NoArgsConstructor
public class AdminDashboardStatsResponse {
    private long totalUsers;
    private long todayNewUsers;
    private long totalSales;
    private long todaySales;
    private long suspendedUsers;
    private long activeUsers;
}