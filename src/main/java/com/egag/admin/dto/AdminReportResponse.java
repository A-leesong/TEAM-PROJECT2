package com.egag.admin.dto;

import com.egag.admin.Report;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminReportResponse {
    private String id;
    private String artworkId;
    private String artworkTitle;
    private String artworkImageUrl;
    private String authorNickname;
    private String reporterNickname;
    private String reason;
    private String description;
    private String status;
    private LocalDateTime createdAt;

    public static AdminReportResponse from(Report report) {
        String artworkId = null;
        String artworkTitle = "삭제된 작품";
        String artworkImageUrl = null;
        String authorNickname = "알 수 없음";
        
        if (report.getArtwork() != null) {
            artworkId = report.getArtwork().getId();
            artworkTitle = report.getArtwork().getTitle();
            artworkImageUrl = report.getArtwork().getImageUrl();
            if (report.getArtwork().getUser() != null) {
                authorNickname = report.getArtwork().getUser().getNickname();
            }
        }

        String reporterNickname = (report.getReporter() != null) ? report.getReporter().getNickname() : "탈퇴한 사용자";

        return AdminReportResponse.builder()
                .id(report.getId())
                .artworkId(artworkId)
                .artworkTitle(artworkTitle)
                .artworkImageUrl(artworkImageUrl)
                .authorNickname(authorNickname)
                .reporterNickname(reporterNickname)
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
