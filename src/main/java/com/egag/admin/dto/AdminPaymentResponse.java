package com.egag.admin.dto;

import com.egag.payment.Payment;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class AdminPaymentResponse {
    private String id;
    private String userId;      
    private String userEmail;   
    private String nickname;    // (추가) 유저 닉네임
    private Integer amount;     
    private Integer tokenCount; // (추가) 구매 토큰 수
    private String status;
    private String payMethod;
    private String orderName;   
    private String orderId;     
    private LocalDateTime createdAt;

    public static AdminPaymentResponse of(Payment entity) {
        return AdminPaymentResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId().toString() : "Unknown")
                .userEmail(entity.getUser() != null ? entity.getUser().getEmail() : "N/A")
                .nickname(entity.getUser() != null ? entity.getUser().getNickname() : "Unknown")
                .amount(entity.getAmount())
                .tokenCount(entity.getTokenAmount())
                .status(entity.getStatus())
                .payMethod(entity.getPayMethod())
                .orderName(entity.getPackageName())
                .orderId(entity.getMerchantUid())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}