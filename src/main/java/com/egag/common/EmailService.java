package com.egag.common;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendInquiryConfirmation(String toEmail, String title) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[이그에그] 문의 접수가 완료되었습니다.");
        message.setText("안녕하세요, 이그에그(EggEgg) 팀입니다.\n\n" +
                "고객님의 문의 '" + title + "'가 정상적으로 접수되었습니다.\n" +
                "영업일 기준 1~3일 내에 답변을 드릴 예정입니다.\n\n" +
                "감사합니다.");

        mailSender.send(message);
    }

    // [2] 신규 정책 변경 알림 메일 (추가된 부분)
    @Async
    public void sendPolicyChangeNotification(String toEmail, String policyName, String effectiveDate) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[이그에그] " + policyName + " 개정 안내 (7일 전 사전 공지)");
        message.setText("안녕하세요, 이그에그(EggEgg) 팀입니다.\n\n" +
                "이그에그 서비스를 이용해 주시는 고객님께 감사드립니다.\n" +
                "새로운 서비스 제공 및 관련 법령 준수를 위해 [" + policyName + "]이 개정될 예정입니다.\n\n" +
                "- 개정 대상: " + policyName + "\n" +
                "- 적용 일자: " + effectiveDate + " (7일 후)\n\n" +
                "변경된 상세 내용은 홈페이지 하단 법적 페이지에서 확인하실 수 있습니다.\n" +
                "감사합니다.");

        mailSender.send(message);
    }
}