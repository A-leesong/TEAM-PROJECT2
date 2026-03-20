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

    // ✅ 차트용 데이터 필드 추가!
    private List<ProductStat> topProducts;
    private List<PaymentStat> paymentMethodRatio;

    // 내부 클래스로 데이터 구조 정의 (따로 파일을 만드셔도 됩니다)
    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class ProductStat {
        private String name;
        private long count;
    }

    @Getter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class PaymentStat {
        private String name;
        private long value;
    }
}