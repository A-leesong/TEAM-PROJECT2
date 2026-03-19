// com.egag.admin.AdminService.java
package com.egag.admin;

import com.egag.common.domain.User;
import com.egag.common.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AdminActionLogRepository logRepository; // 생성 필요

    @Transactional
    public void giveManualToken(String adminId, Long userId, Integer amount, String reason) {
        // 1. 대상 유저 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        // 2. 유저 토큰 증액 (User 엔티티에 addToken 메서드 구현 권장)
        user.addToken(amount);

        // 3. 관리자 작업 로그 기록
        AdminActionLog log = new AdminActionLog();
        log.setAdminId(adminId);
        log.setTargetUserId(userId);
        log.setAmount(amount);
        log.setReason(reason);
        log.setCreatedAt(LocalDateTime.now());

        logRepository.save(log);
    }
}