package com.egag.artwork;

import com.egag.auth.PrincipalDetails;
import com.egag.artwork.dto.ArtworkResponse;
import com.egag.artwork.dto.ReportRequest;
import com.egag.common.exception.CustomException;
import com.egag.user.ArtworkSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artworks")
@RequiredArgsConstructor
public class ArtworkController {

    private final ArtworkService artworkService;

    // ── 내 갤러리에 저장 ────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ArtworkSummary> save(Authentication auth, @RequestBody SaveArtworkRequest req) {
        return ResponseEntity.ok(artworkService.saveToGallery(auth.getName(), req));
    }

    // ── 공개/비공개 토글 (ArtworkSummary 반환 - MyPage용) ──────
    @PatchMapping("/{id}/visibility")
    public ResponseEntity<ArtworkSummary> toggleVisibility(Authentication auth, @PathVariable String id) {
        return ResponseEntity.ok(artworkService.toggleVisibility(auth.getName(), id));
    }

    // ── 작품 상세 조회 ──────────────────────────────────────────
    @GetMapping("/{id}")
    public ArtworkResponse getArtwork(@PathVariable String id) {
        return artworkService.getArtwork(id);
    }

    // ── 갤러리 탐색 ─────────────────────────────────────────────
    @GetMapping("/explore")
    public List<ArtworkResponse> explore(
            @RequestParam(required = false, defaultValue = "latest") String sort,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int limit) {
        return artworkService.explore(sort, cursor, limit);
    }

    // ── 좋아요 토글 ─────────────────────────────────────────────
    @PostMapping("/{id}/like")
    public void toggleLike(@PathVariable String id, @AuthenticationPrincipal PrincipalDetails principal) {
        if (principal == null) throw new CustomException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "로그인이 필요합니다.");
        artworkService.toggleLike(id, principal.getUserId());
    }

    // ── 삭제 ────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public void deleteArtwork(@PathVariable String id, @AuthenticationPrincipal PrincipalDetails principal) {
        if (principal == null) throw new CustomException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "로그인이 필요합니다.");
        artworkService.deleteArtwork(id, principal.getUserId());
    }

    // ── 공개/비공개 토글 (void - 갤러리 페이지용) ──────────────
    @PatchMapping("/{id}/public")
    public void togglePublic(@PathVariable String id, @AuthenticationPrincipal PrincipalDetails principal) {
        if (principal == null) throw new CustomException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "로그인이 필요합니다.");
        artworkService.togglePublic(id, principal.getUserId());
    }

    // ── 제목 수정 ────────────────────────────────────────────────
    @PatchMapping("/{id}/title")
    public ResponseEntity<Void> updateTitle(
            @PathVariable String id,
            @AuthenticationPrincipal PrincipalDetails principal,
            @RequestBody java.util.Map<String, String> body) {
        if (principal == null) throw new CustomException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "로그인이 필요합니다.");
        artworkService.updateTitle(id, principal.getUserId(), body.get("title"));
        return ResponseEntity.ok().build();
    }

    // ── 신고 ────────────────────────────────────────────────────
    @PostMapping("/{id}/report")
    public void reportArtwork(@PathVariable String id, @AuthenticationPrincipal PrincipalDetails principal, @RequestBody ReportRequest request) {
        if (principal == null) throw new CustomException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "로그인이 필요합니다.");
        artworkService.reportArtwork(id, principal.getUserId(), request);
    }
}
