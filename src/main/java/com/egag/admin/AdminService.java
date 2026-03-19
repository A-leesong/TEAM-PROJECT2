package com.egag.admin;

import com.egag.admin.dto.AdminDashboardStatsResponse;
import com.egag.common.domain.User;
import com.egag.common.domain.UserRepository;
import com.egag.payment.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AdminActionLogRepository logRepository;
    private final PaymentRepository paymentRepository;

    // 📊 실시간 대시보드 통계 계산
    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getRealDashboardStats() {
        long totalUsers = userRepository.count();
        LocalDateTime startOfToday = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        long todayNewUsers = userRepository.countByCreatedAtAfter(startOfToday);
        long suspendedUsers = userRepository.countByIsSuspended(true);

        Long totalSales = paymentRepository.sumTotalAmount();
        Long todaySales = paymentRepository.sumAmountByCreatedAtAfter(startOfToday);

        totalSales = (totalSales != null) ? totalSales : 0L;
        todaySales = (todaySales != null) ? todaySales : 0L;

        return AdminDashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .todayNewUsers(todayNewUsers)
                .totalSales(totalSales)
                .todaySales(todaySales)
                .suspendedUsers(suspendedUsers)
                .activeUsers(totalUsers - suspendedUsers)
                .build();
    }

    // ✅ [추가] 유저 활성/비활성 상태 토글 로직
    @Transactional
    public void toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        // 현재 상태가 true면 false로, false면 true로 반전시킴
        boolean currentStatus = user.getIsSuspended() != null && user.getIsSuspended();
        user.setIsSuspended(!currentStatus);

        // 💡 팁: 실제 운영 환경에서는 누가 정지시켰는지 AdminActionLog에 기록을 남기는 것이 좋습니다.
    }

    // ✅ 모든 토큰 지급 로그 조회
    @Transactional(readOnly = true)
    public List<AdminActionLog> getAllTokenLogs() {
        return logRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void giveManualToken(String adminId, String userId, Integer amount, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        user.addToken(amount);

        AdminActionLog log = AdminActionLog.builder()
                .adminId(adminId)
                .targetUserId(userId)
                .targetNickname(user.getNickname())
                .amount(amount)
                .reason(reason)
                .createdAt(LocalDateTime.now())
                .build();

        logRepository.save(log);
    }
}