package com.egag.admin;

import com.egag.admin.dto.AdminDashboardStatsResponse;
import com.egag.admin.dto.TokenRequest;
import com.egag.common.domain.ArtworkRepository;
import com.egag.common.domain.UserRepository;
import com.egag.inquiry.InquiryRepository;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final InquiryRepository inquiryRepository;
    private final ArtworkRepository artworkRepository;

    // 📊 1. 대시보드 통계 데이터 API (진짜 데이터 연동)
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStatsResponse> getDashboardStats() {
        AdminDashboardStatsResponse stats = adminService.getRealDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // 📝 2. 토큰 지급 로그 전체 조회 API
    @GetMapping("/tokens/logs")
    public ResponseEntity<List<?>> getTokenLogs() {
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

    // 🚫 [추가] 8. 유저 활성/정지 상태 토글 API
    // 프론트에서 /api/admin/users/{userId}/status 로 요청을 보내면 됩니다.
    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<String> toggleUserStatus(@PathVariable String userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok("유저 상태가 성공적으로 변경되었습니다.");
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

    // 📊 8. 문의 카테고리별 접수 수
    @GetMapping("/stats/inquiry-categories")
    public ResponseEntity<Map<String, Long>> getInquiryCategoryStats() {
        List<Object[]> rows = inquiryRepository.countByCategory();
        Map<String, Long> result = rows.stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));
        return ResponseEntity.ok(result);
    }

    // 📈 9. 날짜별 이미지 생성 수 (최근 14일)
    @GetMapping("/stats/artwork-by-date")
    public ResponseEntity<List<Map<String, Object>>> getArtworkByDate() {
        LocalDateTime since = LocalDateTime.now().minusDays(14).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<Object[]> rows = artworkRepository.countByDateSince(since);
        List<Map<String, Object>> result = rows.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", r[0].toString());
            m.put("count", ((Number) r[1]).longValue());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}