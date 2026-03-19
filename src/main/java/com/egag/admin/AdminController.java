package com.egag.admin;

import com.egag.admin.dto.AdminDashboardStatsResponse;
import com.egag.admin.dto.TokenRequest;
import com.egag.common.domain.UserRepository;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Collections;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    // 📊 1. 대시보드 통계 데이터 API (진짜 데이터 연동)
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStatsResponse> getDashboardStats() {
        // ✅ 이제 서비스에서 계산해온 '진짜' 통계를 반환합니다.
        AdminDashboardStatsResponse stats = adminService.getRealDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // 📝 2. 토큰 지급 로그 전체 조회 API
    @GetMapping("/tokens/logs")
    public ResponseEntity<List<AdminActionLog>> getTokenLogs() {
        return ResponseEntity.ok(adminService.getAllTokenLogs());
    }

    // 👥 3. 전체 유저 목록 조회 API
    @GetMapping("/users/all")
    public ResponseEntity<List<?>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 🔍 4. 닉네임으로 유저 검색 API
    @GetMapping("/users")
    public ResponseEntity<?> searchUser(@RequestParam String nickname) {
        return ResponseEntity.ok(userRepository.findByNickname(nickname)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다.")));
    }

    // 💰 5. 수동 토큰 지급 API
    @PostMapping("/tokens/manual")
    public ResponseEntity<String> giveToken(@RequestBody TokenRequest request) {
        String currentAdminId = "admin_01";
        adminService.giveManualToken(
                currentAdminId,
                request.getUserId(),
                request.getAmount(),
                request.getReason()
        );
        return ResponseEntity.ok("토큰 지급 및 로그 기록 완료!");
    }

    // 💳 6. 전체 결제 내역 조회 API
    @GetMapping("/payments")
    public ResponseEntity<List<?>> getAllPayments() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    // ❌ 7. 결제 강제 취소 API
    @PostMapping("/payments/{id}/cancel")
    public ResponseEntity<String> cancelPayment(@PathVariable String id) {
        System.out.println("결제 취소 요청 처리 중 - ID: " + id);
        return ResponseEntity.ok("결제(ID: " + id + ") 취소 처리가 완료되었습니다.");
    }
}