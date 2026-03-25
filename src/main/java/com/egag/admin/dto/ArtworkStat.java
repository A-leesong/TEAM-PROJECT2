package com.egag.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArtworkStat {
    private String artworkId;
    private String title;
    private String author;
    private long likeCount;
    private String imageUrl;
}
