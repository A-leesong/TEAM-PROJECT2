package com.egag.admin;

import com.egag.admin.dto.*;
import com.egag.auth.PrincipalDetails;
import com.egag.common.domain.ArtworkRepository;
import com.egag.common.domain.User;
import com.egag.common.domain.UserRepository;
import com.egag.inquiry.InquiryRepository;
import com.egag.payment.PaymentRepository;
import lombok.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
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
    private final PaymentRepository paymentRepository;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStatsResponse> getDashboardStats() {
        AdminDashboardStatsResponse stats = adminService.getRealDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Admin API is ALIVE");
    }

    @GetMapping("/tokens/logs")
    public ResponseEntity<List<?>> getTokenLogs() {
        return ResponseEntity.ok(adminService.getAllTokenLogs());
    }

    @GetMapping("/users/all")
    public ResponseEntity<List<?>> getAllUsers() {
        return ResponseEntity.ok(
            userRepository.findAll().stream().map(u -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", u.getId());
                m.put("nickname", u.getNickname());
                m.put("email", u.getEmail());
                m.put("role", u.getRole());
                m.put("tokenBalance", u.getTokenBalance());
                m.put("isActive", u.getIsSuspended() == null || !u.getIsSuspended());
                m.put("createdAt", u.getCreatedAt());
                return m;
            }).collect(Collectors.toList())
        );
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<?>> searchUser(@RequestParam String keyword) {
        return ResponseEntity.ok(
            userRepository.searchByKeyword(keyword).stream().map(u -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", u.getId());
                m.put("nickname", u.getNickname());
                m.put("email", u.getEmail());
                m.put("role", u.getRole());
                m.put("tokenBalance", u.getTokenBalance());
                m.put("isActive", u.getIsSuspended() == null || !u.getIsSuspended());
                m.put("createdAt", u.getCreatedAt());
                return m;
            }).collect(Collectors.toList())
        );
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<String> toggleUserStatus(@PathVariable String userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok("유저 상태가 성공적으로 변경되었습니다.");
    }

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

    @GetMapping("/payments")
    public ResponseEntity<Page<com.egag.admin.dto.AdminPaymentResponse>> getAdminPayments(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @PageableDefault(size = 10) Pageable pageable) {
        LocalDateTime fromDt = (from != null && !from.isBlank()) ? LocalDate.parse(from).atStartOfDay() : null;
        LocalDateTime toDt = (to != null && !to.isBlank()) ? LocalDate.parse(to).atTime(23, 59, 59) : null;
        return ResponseEntity.ok(adminService.getAdminPayments(keyword, fromDt, toDt, pageable));
    }

    @GetMapping("/payments/stats")
    public ResponseEntity<java.util.Map<String, Long>> getPaymentStats(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        LocalDateTime fromDt = (from != null && !from.isBlank()) ? LocalDate.parse(from).atStartOfDay() : null;
        LocalDateTime toDt = (to != null && !to.isBlank()) ? LocalDate.parse(to).atTime(23, 59, 59) : null;
        long sum = (fromDt != null && toDt != null) ? adminService.sumPaymentsBetween(fromDt, toDt) : 0L;
        return ResponseEntity.ok(java.util.Map.of("total", sum));
    }

    @PostMapping("/payments/{id}/cancel")
    public ResponseEntity<String> cancelPayment(@PathVariable String id) {
        return ResponseEntity.ok("결제(ID: " + id + ") 취소 처리가 완료되었습니다.");
    }

    @GetMapping("/stats/inquiry-categories")
    public ResponseEntity<Map<String, Long>> getInquiryCategoryStats() {
        List<Object[]> rows = inquiryRepository.countByCategory();
        Map<String, Long> result = rows.stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats/user-by-date")
    public ResponseEntity<List<Map<String, Object>>> getUserByDate() {
        LocalDateTime since = LocalDateTime.now().minusDays(14).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<Object[]> rows = userRepository.countByDateSince(since);
        List<Map<String, Object>> result = rows.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", r[0].toString());
            m.put("count", ((Number) r[1]).longValue());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats/revenue-by-date")
    public ResponseEntity<List<Map<String, Object>>> getRevenueByDate() {
        LocalDateTime since = LocalDateTime.now().minusDays(14).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<Object[]> rows = paymentRepository.sumAmountByDateSince(since);
        List<Map<String, Object>> result = rows.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", r[0].toString());
            m.put("amount", r[1] != null ? ((Number) r[1]).longValue() : 0L);
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

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

    @GetMapping("/reports")
    public ResponseEntity<Page<AdminReportResponse>> getAdminReports(
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAdminReports(status, keyword, pageable));
    }

    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<String> resolveReport(
            @PathVariable String id,
            @AuthenticationPrincipal PrincipalDetails principal) {
        User admin = principal.getUser();
        adminService.resolveReport(id, admin);
        return ResponseEntity.ok("신고가 처리완료 상태로 변경되었습니다.");
    }

    @DeleteMapping("/artworks/{id}")
    public ResponseEntity<String> deleteArtwork(@PathVariable String id) {
        adminService.deleteArtwork(id);
        return ResponseEntity.ok("작품이 삭제되었습니다.");
    }

    @PatchMapping("/artworks/{id}/visibility")
    public ResponseEntity<String> toggleArtworkVisibility(@PathVariable String id) {
        adminService.toggleArtworkVisibility(id);
        return ResponseEntity.ok("작품 노출 상태가 변경되었습니다.");
    }

    @GetMapping("/main-images")
    public ResponseEntity<List<MainBannerResponse>> getMainImages() {
        return ResponseEntity.ok(adminService.getMainImages());
    }

    @DeleteMapping("/main-images/{slotNumber}")
    public ResponseEntity<String> clearMainImageSlot(@PathVariable Integer slotNumber) {
        adminService.clearMainImageSlot(slotNumber);
        return ResponseEntity.ok("슬롯이 초기화되었습니다.");
    }

    @PostMapping("/main-images/assign")
    public ResponseEntity<String> assignMainImage(@RequestBody Map<String, Object> payload) {
        String artworkId = (String) payload.get("artworkId");
        Integer slotNumber = ((Number) payload.get("slotNumber")).intValue();
        adminService.assignMainImage(artworkId, slotNumber);
        return ResponseEntity.ok("메인 배너가 성공적으로 설정되었습니다.");
    }

    // 🎨 [고유화] 15. 전체 작품 목록 조회 API (네이밍 충돌 방지)
    @GetMapping("/artwork-all-list")
    public ResponseEntity<Page<AdminArtworkResponse>> getAdminArtworks(
            @PageableDefault(size = 20) Pageable pageable) {
        System.out.println(">>> [DEBUG] AdminController.getAdminArtworks hit! Page: " + pageable.getPageNumber());
        return ResponseEntity.ok(adminService.getAdminArtworks(pageable));
    }
}