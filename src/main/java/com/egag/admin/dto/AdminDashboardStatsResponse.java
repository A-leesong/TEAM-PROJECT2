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

    // ✅ 외부 파일로 만든 클래스들을 리스트로 선언
    private List<ProductStat> topProducts;
    private List<PaymentStat> paymentMethodRatio;
}