package com.egag.common;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from}")
    private String fromAddress;

    @Async
    public void sendInquiryConfirmation(String toEmail, String title) {
        String html = """
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                  <h2 style="color: #7C3AED;">📬 문의 접수 완료</h2>
                  <p>안녕하세요, 이그에그(EggEgg) 팀입니다.</p>
                  <p>고객님의 문의 <strong>'%s'</strong>가 정상적으로 접수되었습니다.<br>
                  영업일 기준 1~3일 내에 답변을 드릴 예정입니다.</p>
                  <p style="color: #94A3B8; font-size: 13px;">감사합니다.</p>
                </div>
                """.formatted(title);
        send(toEmail, "[이그에그] 문의 접수가 완료되었습니다.", html);
    }

    @Async
    public void sendInquiryReply(String toEmail, String title, String reply) {
        String html = """
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                  <h2 style="color: #7C3AED;">💬 문의 답변 도착</h2>
                  <p>안녕하세요, 이그에그(EggEgg) 팀입니다.</p>
                  <p>고객님께서 문의하신 <strong>'%s'</strong>에 대한 답변을 드립니다.</p>
                  <div style="background:#F3F4F6; border-left:4px solid #7C3AED; padding:16px; border-radius:8px; margin:16px 0;">
                    %s
                  </div>
                  <p style="color: #94A3B8; font-size: 13px;">추가 문의사항이 있으시면 언제든지 문의해 주세요. 감사합니다.</p>
                </div>
                """.formatted(title, reply.replace("\n", "<br>"));
        send(toEmail, "[이그에그] 문의하신 내용에 답변이 도착했습니다.", html);
    }

    @Async
    public void sendPolicyChangeNotification(String toEmail, String policyName, String effectiveDate) {
        String html = """
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                  <h2 style="color: #7C3AED;">📋 정책 변경 안내</h2>
                  <p>안녕하세요, 이그에그(EggEgg) 팀입니다.</p>
                  <p>새로운 서비스 제공 및 관련 법령 준수를 위해 <strong>[%s]</strong>이 개정될 예정입니다.</p>
                  <ul>
                    <li>개정 대상: %s</li>
                    <li>적용 일자: %s (7일 후)</li>
                  </ul>
                  <p style="color: #94A3B8; font-size: 13px;">변경된 상세 내용은 홈페이지 하단 법적 페이지에서 확인하실 수 있습니다. 감사합니다.</p>
                </div>
                """.formatted(policyName, policyName, effectiveDate);
        send(toEmail, "[이그에그] " + policyName + " 개정 안내 (7일 전 사전 공지)", html);
    }

    private void send(String toEmail, String subject, String html) {
        try {
            Resend resend = new Resend(apiKey);
            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(fromAddress)
                    .to(toEmail)
                    .subject(subject)
                    .html(html)
                    .build();
            resend.emails().send(options);
            log.info("메일 발송 완료: {}", toEmail);
        } catch (ResendException e) {
            log.error("메일 발송 실패 ({}): {}", toEmail, e.getMessage());
        }
    }
}