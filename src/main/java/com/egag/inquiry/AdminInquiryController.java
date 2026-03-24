package com.egag.inquiry;

import com.egag.auth.PrincipalDetails;
import com.egag.inquiry.dto.InquiryAdminResponse;
import com.egag.inquiry.dto.ReplyRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inquiries")
@RequiredArgsConstructor
public class AdminInquiryController {

    private final InquiryService inquiryService;

    // 전체 또는 pending 문의 목록
    @GetMapping
    public ResponseEntity<List<InquiryAdminResponse>> getInquiries(
            @RequestParam(defaultValue = "all") String status) {
        return ResponseEntity.ok(inquiryService.getAdminInquiries(status));
    }

    // 대시보드용 미응답 최대 5건
    @GetMapping("/pending")
    public ResponseEntity<List<InquiryAdminResponse>> getPending(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(inquiryService.getPendingInquiries(limit));
    }

    // 답변 등록
    @PostMapping("/{id}/reply")
    public ResponseEntity<Void> reply(
            @PathVariable String id,
            @RequestBody ReplyRequest request,
            @AuthenticationPrincipal PrincipalDetails principal) {
        inquiryService.replyToInquiry(id, request.getReply(), principal.getUser());
        return ResponseEntity.ok().build();
    }
}
