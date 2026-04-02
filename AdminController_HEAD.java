package com.egag.admin;

import com.egag.admin.dto.*;
import com.egag.common.domain.ArtworkRepository;
import com.egag.common.domain.UserRepository;
import com.egag.inquiry.InquiryRepository;
import lombok.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/search") 
    public ResponseEntity<List<?>> searchUser(@RequestParam String keyword) { 
        Optional<?> user = userRepository.findByNickname(keyword)
                .or(() -> userRepository.findByEmail(keyword));
        return ResponseEntity.ok(user.map(List::of).orElse(List.of()));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<String> toggleUserStatus(@PathVariable String userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok("?좎? ?곹깭媛 ?깃났?곸쑝濡?蹂寃쎈릺?덉뒿?덈떎.");
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
        return ResponseEntity.ok("?좏겙 吏湲?諛?濡쒓렇 湲곕줉 ?꾨즺!");
    }

    @GetMapping("/payments")
    public ResponseEntity<Page<com.egag.admin.dto.AdminPaymentResponse>> getAdminPayments(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAdminPayments(keyword, pageable));
    }

    @PostMapping("/payments/{id}/cancel")
    public ResponseEntity<String> cancelPayment(@PathVariable String id) {
        return ResponseEntity.ok("寃곗젣(ID: " + id + ") 痍⑥냼 泥섎━媛 ?꾨즺?섏뿀?듬땲??");
    }

    @GetMapping("/stats/inquiry-categories")
    public ResponseEntity<Map<String, Long>> getInquiryCategoryStats() {
        List<Object[]> rows = inquiryRepository.countByCategory();
        Map<String, Long> result = rows.stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));
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

    @PatchMapping("/artworks/{id}/visibility")
    public ResponseEntity<String> toggleArtworkVisibility(@PathVariable String id) {
        adminService.toggleArtworkVisibility(id);
        return ResponseEntity.ok("?묓뭹 ?몄텧 ?곹깭媛 蹂寃쎈릺?덉뒿?덈떎.");
    }

    @GetMapping("/main-images")
    public ResponseEntity<List<MainBannerResponse>> getMainImages() {
        return ResponseEntity.ok(adminService.getMainImages());
    }

    @PostMapping("/main-images/assign")
    public ResponseEntity<String> assignMainImage(@RequestBody Map<String, Object> payload) {
        String artworkId = (String) payload.get("artworkId");
        Integer slotNumber = ((Number) payload.get("slotNumber")).intValue();
        adminService.assignMainImage(artworkId, slotNumber);
        return ResponseEntity.ok("硫붿씤 諛곕꼫媛 ?깃났?곸쑝濡??ㅼ젙?섏뿀?듬땲??");
    }

    // ?렓 [怨좎쑀?? 15. ?꾩껜 ?묓뭹 紐⑸줉 議고쉶 API (?ㅼ씠諛?異⑸룎 諛⑹?)
    @GetMapping("/artwork-all-list")
    public ResponseEntity<Page<AdminArtworkResponse>> getAdminArtworks(
            @PageableDefault(size = 20) Pageable pageable) {
        System.out.println(">>> [DEBUG] AdminController.getAdminArtworks hit! Page: " + pageable.getPageNumber());
        return ResponseEntity.ok(adminService.getAdminArtworks(pageable));
    }
}
