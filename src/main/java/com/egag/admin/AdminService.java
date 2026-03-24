package com.egag.admin;

import com.egag.admin.dto.AdminDashboardStatsResponse;
import com.egag.admin.dto.PaymentStat;
import com.egag.admin.dto.ProductStat;
import com.egag.common.domain.User;
import com.egag.common.domain.UserRepository;
import com.egag.payment.PaymentRepository;
import com.egag.payment.TokenLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final TokenLogRepository tokenLogRepository;
    private final UserRepository userRepository;
    private final AdminActionLogRepository logRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getRealDashboardStats() {
        long totalUsers = userRepository.count();
        LocalDateTime startOfToday = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        long todayNewUsers = userRepository.countByCreatedAtAfter(startOfToday);
        // UserRepository의 countByIsSuspended 파라미터가 Boolean 객체인 경우를 위해 Boolean.TRUE 사용
        long suspendedUsers = userRepository.countByIsSuspended(Boolean.TRUE);

        Long totalSalesRaw = paymentRepository.sumTotalAmount();
        Long todaySalesRaw = paymentRepository.sumAmountByCreatedAtAfter(startOfToday);

        // 빌더가 long(원시타입)을 요구할 경우를 대비해 0L 기본값 처리
        long totalSales = (totalSalesRaw != null) ? totalSalesRaw : 0L;
        long todaySales = (todaySalesRaw != null) ? todaySalesRaw : 0L;

        // 리스트 데이터 추가
        List<ProductStat> topProducts = paymentRepository.findTopProducts();
        List<PaymentStat> paymentMethodRatio = paymentRepository.findPaymentMethodRatio();

        return AdminDashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .todayNewUsers(todayNewUsers)
                .totalSales(totalSales)
                .todaySales(todaySales)
                .suspendedUsers(suspendedUsers)
                .activeUsers(totalUsers - suspendedUsers)
                .topProducts(topProducts)
                .paymentMethodRatio(paymentMethodRatio)
                .build();
    }

    @Transactional
    public void toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 유저입니다."));

        // Boolean 객체와 boolean 기본형 비교 처리
        boolean currentStatus = (user.getIsSuspended() != null && user.getIsSuspended());
        user.setIsSuspended(!currentStatus);
    }

    @Transactional(readOnly = true)
    public List<?> getAllTokenLogs() {
        return tokenLogRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void giveManualToken(String adminId, String userId, Integer amount, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 유저입니다."));

        user.addToken(amount);

        AdminActionLog adminLog = AdminActionLog.builder()
                .adminId(adminId)
                .targetUserId(userId)
                .targetNickname(user.getNickname())
                .amount(amount)
                .reason(reason)
                .createdAt(LocalDateTime.now())
                .build();
        logRepository.save(adminLog);

        com.egag.payment.TokenLog tokenLog = com.egag.payment.TokenLog.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .amount(amount)
                .balanceAfter(user.getTokenBalance())
                .type("MANUAL")
                .reason(reason)
                .createdAt(LocalDateTime.now())
                .build();
        tokenLogRepository.save(tokenLog);
    }
}