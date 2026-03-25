package com.egag.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminArtworkResponse {
    private String id;
    private String title;
    private String imageUrl;
    private String nickname;
    private Boolean isVisible;
    private java.time.LocalDateTime createdAt;
    private Integer likeCount;
}
