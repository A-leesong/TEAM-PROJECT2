package com.egag.canvas;

import com.egag.common.domain.Artwork;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CanvasSessionResponse {

    private String id;
    private String status;
    private String topic;
    private String strokeData;
    private String aiContext;
    private Integer turnCount;
    private Integer userStrokeCount;
    private Integer aiStrokeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CanvasSessionResponse from(Artwork artwork) {
        return CanvasSessionResponse.builder()
                .id(artwork.getId())
                .status(artwork.getStatus())
                .topic(artwork.getTopic())
                .strokeData(artwork.getStrokeData())
                .aiContext(artwork.getAiContext())
                .turnCount(artwork.getTurnCount())
                .userStrokeCount(artwork.getUserStrokeCount())
                .aiStrokeCount(artwork.getAiStrokeCount())
                .createdAt(artwork.getCreatedAt())
                .updatedAt(artwork.getUpdatedAt())
                .build();
    }
}
