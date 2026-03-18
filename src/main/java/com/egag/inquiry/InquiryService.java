package com.egag.inquiry;

import com.egag.common.EmailService;
import com.egag.common.domain.User;
import com.egag.inquiry.dto.InquiryRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final EmailService emailService;
    private final String uploadPath = "C:/uploads/inquiries/";

    // 허용할 확장자 리스트
    private final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");

    @Transactional
    public void saveInquiry(InquiryRequest request, MultipartFile file, User user) {
        String attachmentUrl = null;

        if (file != null && !file.isEmpty()) {
            validateFile(file); // 확장자 및 용량 체크
            attachmentUrl = saveFile(file); // 실제 저장 및 DB용 경로 반환
        }

        // Builder 패턴 사용 시, 엔티티 필드 구성 확인 필요
        Inquiry inquiry = Inquiry.builder()
                .id(UUID.randomUUID().toString())
                .user(user) // 만약 엔티티에 User 필드가 있다면 OK!
                .email(request.getEmail())
                .category(request.getCategory())
                .title(request.getTitle())
                .content(request.getContent())
                .attachmentUrl(attachmentUrl)
                .status("pending")
                .build();

        inquiryRepository.save(inquiry);

        // [개선안] 비동기로 메일 발송을 처리하면 사용자 응답 속도가 더 빨라집니다.
        // 현재는 try-catch로 잘 방어하셨습니다!
        sendEmailSafe(inquiry);
    }

    private void sendEmailSafe(Inquiry inquiry) {
        try {
            emailService.sendInquiryConfirmation(inquiry.getEmail(), inquiry.getTitle());
        } catch (Exception e) {
            // 로그를 남겨두는 것이 나중에 디버깅하기 좋습니다.
            log.error("문의 확인 메일 발송 실패 (이메일: {}): {}", inquiry.getEmail(), e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !originalFileName.contains(".")) {
            throw new IllegalArgumentException("올바르지 않은 파일 형식입니다.");
        }

        // 확장자 추출 (소문자로 통일)
        String extension = originalFileName.substring(originalFileName.lastIndexOf(".") + 1).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("허용되지 않는 파일 확장자입니다. (JPG, PNG, GIF만 가능)");
        }

        // 용량 체크 (명세서의 5MB 기준 - application.yml 설정 외에 코드에서도 한 번 더 체크 가능)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("파일 크기는 5MB를 초과할 수 없습니다.");
        }
    }

    private String saveFile(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            File saveFile = new File(uploadPath, fileName);

            // 디렉토리가 없으면 생성
            if (!saveFile.getParentFile().exists()) {
                saveFile.getParentFile().mkdirs();
            }

            file.transferTo(saveFile);
            return "/images/inquiries/" + fileName; // 프론트에서 접근 가능한 URL 경로 반환
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 중 오류가 발생했습니다.", e);
        }
    }
}