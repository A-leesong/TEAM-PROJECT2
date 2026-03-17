package com.egag.canvas;

import com.egag.common.domain.Artwork;
import com.egag.common.domain.ArtworkRepository;
import com.egag.common.domain.User;
import com.egag.common.domain.UserRepository;
import com.egag.common.exception.CustomException;
import dev.langchain4j.data.message.ImageContent;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.TextContent;
import dev.langchain4j.data.message.UserMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CanvasService {

    private final ArtworkRepository artworkRepository;
    private final UserRepository userRepository;
    private final OpenAiClient openAiClient;

    private static final String[] TOPICS = {
            "나비", "하트", "꽃", "얼굴", "왕관",
            "별", "크리스마스트리", "로켓", "문어", "부엉이"
    };

    // ─────────────────────────────────────────────────────
    // 세션 시작: 주제만 랜덤 선택
    // ─────────────────────────────────────────────────────

    @org.springframework.transaction.annotation.Transactional
    public StartSessionResponse startSession(String nickname, String email) {
        User user;
        if (email != null) {
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new CustomException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다"));
            if (user.getTokenBalance() <= 0) {
                throw new CustomException(HttpStatus.PAYMENT_REQUIRED, "TOKEN_INSUFFICIENT", "토큰이 부족합니다. 토큰을 충전해주세요.");
            }
            user.setTokenBalance(user.getTokenBalance() - 1);
            userRepository.save(user);
        } else {
            user = userRepository.findByNickname(nickname)
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                .id(UUID.randomUUID().toString())
                                .email(UUID.randomUUID().toString().substring(0, 8) + "@demo.egag.com")
                                .nickname(nickname.length() > 12 ? nickname.substring(0, 12) : nickname)
                                .build();
                        return userRepository.save(newUser);
                    });
        }

        String topic = TOPICS[new Random().nextInt(TOPICS.length)];
        String artworkId = UUID.randomUUID().toString();

        Artwork artwork = Artwork.builder()
                .id(artworkId)
                .user(user)
                .topic(topic)
                .strokeData("[]")
                .aiContext("[]")
                .status("drawing")
                .build();
        artworkRepository.save(artwork);

        log.info("🎨 세션 시작: topic={}, id={}", topic, artworkId);

        return StartSessionResponse.builder()
                .id(artworkId)
                .topic(topic)
                .message("캔버스에 자유롭게 그려봐요! 완성하면 AI가 데칼코마니로 완성해요 🪞")
                .build();
    }

    // ─────────────────────────────────────────────────────
    // 완성: 완성된 캔버스 이미지를 받아 AI가 뭔지 맞추기
    // ─────────────────────────────────────────────────────

    public CompleteResponse complete(String artworkId, String canvasBase64) {
        Artwork artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CANVAS_NOT_FOUND", "캔버스를 찾을 수 없습니다"));

        artwork.setStatus("completed");
        artworkRepository.save(artwork);

        String guess = guessImage(canvasBase64, artwork.getTopic());
        log.info("🤔 AI 추측: {}", guess);

        return CompleteResponse.builder()
                .guess(guess)
                .build();
    }

    // ─────────────────────────────────────────────────────
    // 세션 조회
    // ─────────────────────────────────────────────────────

    public CanvasSessionResponse getSession(String id) {
        return artworkRepository.findById(id)
                .map(CanvasSessionResponse::from)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CANVAS_NOT_FOUND", "캔버스 세션을 찾을 수 없습니다"));
    }

    // ─────────────────────────────────────────────────────
    // AI 이미지 추측
    // ─────────────────────────────────────────────────────

    private String guessImage(String canvasBase64, String topic) {
        try {
            var messages = List.of(
                    SystemMessage.from("""
                            너는 어린이 그림을 보고 재미있게 맞추는 AI야.
                            어린이가 데칼코마니로 그린 그림을 보고 무엇처럼 보이는지 말해줘.
                            반드시 한 문장으로만 답해. 이모지 1개 포함. 친근하고 재미있게!
                            예시: "나비처럼 생겼어요! 날개가 예쁘네요 🦋"
                            예시: "하트 모양이에요! 사랑이 넘쳐요 ❤️"
                            """),
                    UserMessage.from(
                            ImageContent.from(canvasBase64, "image/png"),
                            TextContent.from("이 그림이 뭐처럼 보여요? 한 문장으로 말해줘!")
                    )
            );
            return openAiClient.chat(messages);
        } catch (Exception e) {
            log.warn("AI 추측 실패: {}", e.getMessage());
            return "멋진 데칼코마니 작품이에요! 🎨";
        }
    }
}
