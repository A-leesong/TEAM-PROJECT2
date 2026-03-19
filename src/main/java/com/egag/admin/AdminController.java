// com.egag.admin.AdminController.java
package com.egag.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // 수동 토큰 지급 API
    @PostMapping("/tokens/manual")
    public ResponseEntity<String> giveToken(@RequestBody TokenRequest request) {
        // 실제 운영 시에는 SecurityContext에서 관리자 ID를 가져옵니다.
        String currentAdminId = "admin_01";

        adminService.giveManualToken(
                currentAdminId,
                request.getUserId(),
                request.getAmount(),
                request.getReason()
        );

        return ResponseEntity.ok("토큰 지급 및 로그 기록 완료!");
    }
}

// DTO 객체
class TokenRequest {
    private Long userId;
    private Integer amount;
    private String reason;
    // Getter, Setter 생략
}