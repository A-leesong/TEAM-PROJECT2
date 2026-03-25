package com.egag.admin.dto;

import com.egag.admin.MainImage;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MainBannerResponse {
    private Long id;
    private Integer slotNumber;
    private String artworkId;
    private String artworkTitle;
    private String imageUrl;

    public static MainBannerResponse from(MainImage mainImage) {
        return MainBannerResponse.builder()
                .id(mainImage.getId())
                .slotNumber(mainImage.getSlotNumber())
                .artworkId(mainImage.getArtwork() != null ? mainImage.getArtwork().getId() : null)
                .artworkTitle(mainImage.getArtwork() != null ? mainImage.getArtwork().getTitle() : null)
                .imageUrl(mainImage.getImageUrl())
                .build();
    }
}
