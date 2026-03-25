package com.egag.inquiry.dto;

import com.egag.inquiry.Inquiry;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InquiryAdminResponse {
    private String id;
    private String email;
    private String category;
    private String title;
    private String content;
    private String authorNickname;
    private String status;
    private String reply;
    private LocalDateTime createdAt;
    private LocalDateTime repliedAt;

    public static InquiryAdminResponse from(Inquiry inquiry) {
        return InquiryAdminResponse.builder()
                .id(inquiry.getId())
                .authorNickname(inquiry.getUser() != null ? inquiry.getUser().getNickname() : "비회원")
                .email(inquiry.getEmail())
                .category(inquiry.getCategory())
                .title(inquiry.getTitle())
                .content(inquiry.getContent())
                .status(inquiry.getStatus())
                .reply(inquiry.getReply())
                .createdAt(inquiry.getCreatedAt())
                .repliedAt(inquiry.getRepliedAt())
                .build();
    }
}
