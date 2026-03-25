package com.egag.inquiry;

import com.egag.auth.PrincipalDetails;
import com.egag.inquiry.dto.InquiryAdminResponse;
import com.egag.inquiry.dto.ReplyRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inquiries")
@RequiredArgsConstructor
public class AdminInquiryController {

    private final InquiryService inquiryService;

    // 전체 또는 pending 문의 목록 (페이징 & 검색 추가)
    @GetMapping
    public ResponseEntity<Page<InquiryAdminResponse>> getInquiries(
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(inquiryService.getAdminInquiries(status, keyword, pageable));
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
