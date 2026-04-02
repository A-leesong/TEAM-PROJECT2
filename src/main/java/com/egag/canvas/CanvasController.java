package com.egag.canvas;

import com.egag.common.domain.User;
import com.egag.common.domain.UserRepository;
import com.egag.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/canvas")
@RequiredArgsConstructor
public class CanvasController {

    private final ImageTransformService imageTransformService;
    private final CanvasService canvasService;
    private final UserRepository userRepository;

    @PostMapping("/start")
    public ResponseEntity<StartSessionResponse> startSession(
            @RequestBody StartSessionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "NOT_AUTHENTICATED", "로그인이 필요합니다.");
        }
        return ResponseEntity.ok(canvasService.startSession(request.getNickname()));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<CompleteResponse> complete(
            @PathVariable String id,
            @RequestBody CompleteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "NOT_AUTHENTICATED", "로그인이 필요합니다.");
        }
        return ResponseEntity.ok(canvasService.complete(request.getCanvasBase64()));
    }

    @PostMapping("/identify")
    public ResponseEntity<Map<String, String>> identify(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "NOT_AUTHENTICATED", "로그인이 필요합니다.");
        }
        return ResponseEntity.ok(imageTransformService.identifySubject(body.get("canvasBase64")));
    }

    @PostMapping("/consume-token")
    public ResponseEntity<Map<String, Integer>> consumeToken(
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "NOT_AUTHENTICATED", "로그인이 필요합니다.");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new CustomException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다."));

        // 1. DB 원자적 차감 실행 (동시성 방어)
        int updatedRows = userRepository.decrementTokenBalance(user.getId());
        
        if (updatedRows == 0) {
            // 그 사이 다른 요청이 토큰을 모두 사용한 경우
            throw new CustomException(HttpStatus.BAD_REQUEST, "INSUFFICIENT_TOKEN", "토큰이 부족합니다.");
        }

        // 2. 최신 잔액 조회 (응답용)
        int newBalance = userRepository.findById(user.getId())
                .map(User::getTokenBalance)
                .orElse(0);

        return ResponseEntity.ok(Map.of("tokenBalance", newBalance));
    }

    @Transactional
    @PostMapping("/transform")
    public ResponseEntity<TransformResponse> transform(
            @RequestBody TransformRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "NOT_AUTHENTICATED", "로그인이 필요합니다.");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new CustomException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다."));

        // [입장 시 선결제 모델] 진입 시점에 이미 토큰을 차감했으므로, 
        // 변환 시점에는 별도의 잔액 마이너스 체크를 수행하지 않습니다. 

        // 2. AI 변환 실행
        TransformResponse result = imageTransformService.transform(
                request.getCanvasBase64(), request.getStyle(), request.getSubject(), request.getReason());

        // 3. 최신 잔액 조회 (현재 잔액을 그대로 응답에 담아 전달)
        int currentBalance = userRepository.findById(user.getId())
                .map(User::getTokenBalance)
                .orElse(0);

        return ResponseEntity.ok(TransformResponse.builder()
                .imageUrl(result.getImageUrl())
                .prompt(result.getPrompt())
                .style(result.getStyle())
                .story(result.getStory())
                .tokenBalance(currentBalance)
                .build());
}
}
