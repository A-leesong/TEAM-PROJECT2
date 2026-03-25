package com.egag.inquiry;

import com.egag.auth.PrincipalDetails;
import com.egag.common.domain.User;
import com.egag.inquiry.dto.InquiryAdminResponse;
import com.egag.inquiry.dto.InquiryRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<String> createInquiry(
            @RequestPart("inquiry") InquiryRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal PrincipalDetails principal) {

        User currentUser = principal != null ? principal.getUser() : null;
        inquiryService.saveInquiry(request, file, currentUser);
        return ResponseEntity.ok("문의가 정상적으로 접수되었습니다.");
    }

    @GetMapping("/my")
    public ResponseEntity<List<InquiryAdminResponse>> getMyInquiries(
            @AuthenticationPrincipal PrincipalDetails principal) {
        return ResponseEntity.ok(inquiryService.getMyInquiries(principal.getUser().getId()));
    }
}