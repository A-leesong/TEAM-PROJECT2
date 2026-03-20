package com.egag.user;

import com.egag.common.domain.Artwork;
import com.egag.common.domain.ArtworkRepository;
import com.egag.common.domain.User;
import com.egag.common.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GalleryService {

    private final ArtworkRepository artworkRepository;
    private final UserRepository userRepository;

    /** 공개된 모든 작품 목록 (갤러리 페이지용) */
    @Transactional(readOnly = true)
    public List<ArtworkSummary> getPublicArtworks() {
        return artworkRepository.findAllByIsPublicTrue().stream()
                .map(ArtworkSummary::new)
                .collect(Collectors.toList());
    }

    /** 내 갤러리 - 로그인한 사용자의 전체 작품 목록 */
    @Transactional(readOnly = true)
    public List<ArtworkSummary> getMyArtworks(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return artworkRepository.findByUserId(user.getId()).stream()
                .map(ArtworkSummary::new)
                .collect(Collectors.toList());
    }

    /** Canvas/Decalcomania에서 갤러리 저장 */
    @Transactional
    public void saveToGallery(String email, SaveGalleryRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        String aiContext = String.format(
                "{\"style\":\"%s\",\"type\":\"%s\",\"story\":\"%s\"}",
                req.getStyle() != null ? req.getStyle().replace("\"", "'") : "",
                req.getType() != null ? req.getType() : "CANVAS",
                req.getStory() != null ? req.getStory().replace("\"", "'").replace("\n", " ") : ""
        );

        Artwork artwork = Artwork.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .title(req.getStyle() != null ? req.getStyle() : "내 작품")
                .topic(req.getSubject() != null ? req.getSubject() : "")
                .imageUrl(req.getAiImageUrl())
                .strokeData("{}")
                .aiContext(aiContext)
                .status("completed")
                .completedAt(LocalDateTime.now())
                .build();

        artworkRepository.save(artwork);
    }
}
