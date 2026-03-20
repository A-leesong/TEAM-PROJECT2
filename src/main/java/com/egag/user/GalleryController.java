package com.egag.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    /** 공개 갤러리 - 공개된 모든 작품 반환 */
    @GetMapping("/public")
    public ResponseEntity<List<ArtworkSummary>> getPublicArtworks() {
        return ResponseEntity.ok(galleryService.getPublicArtworks());
    }

    /** Canvas/Decalcomania에서 갤러리 저장 */
    @PostMapping("/save")
    public ResponseEntity<Void> saveToGallery(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SaveGalleryRequest request) {
        galleryService.saveToGallery(userDetails.getUsername(), request);
        return ResponseEntity.ok().build();
    }
}
