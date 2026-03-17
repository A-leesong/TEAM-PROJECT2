package com.egag.canvas;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/canvas")
@RequiredArgsConstructor
public class CanvasController {

    private final CanvasService canvasService;

    // 세션 조회 (이어 그리기)
    @GetMapping("/{id}")
    public ResponseEntity<CanvasSessionResponse> getSession(@PathVariable String id) {
        return ResponseEntity.ok(canvasService.getSession(id));
    }

    // 세션 시작: 토큰 1개 차감 후 주제 반환
    @PostMapping("/start")
    public ResponseEntity<StartSessionResponse> startSession(
            @RequestBody StartSessionRequest request,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(canvasService.startSession(request.getNickname(), email));
    }

    // 완성 → AI가 그림 맞추기
    @PostMapping("/{id}/complete")
    public ResponseEntity<CompleteResponse> complete(
            @PathVariable String id,
            @RequestBody CompleteRequest request) {
        return ResponseEntity.ok(canvasService.complete(id, request.getCanvasBase64()));
    }
}
