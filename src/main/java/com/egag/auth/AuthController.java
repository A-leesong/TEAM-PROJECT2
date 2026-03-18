package com.egag.auth;

import com.egag.auth.LoginRequest;
import com.egag.auth.RegisterRequest;
import com.egag.auth.TokenResponse;
import com.egag.auth.PasswordResetRequest;
import com.egag.auth.PasswordResetConfirmRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@RequestBody @Valid RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * 로그인
     * POST /api/auth/login
     * Body: { "email": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Access Token 재발급
     * POST /api/auth/reissue
     * Body: { "refreshToken": "..." }
     */
    @PostMapping("/reissue")
    public ResponseEntity<TokenResponse> reissue(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(authService.reissue(refreshToken));
    }

    /**
     * 로그아웃 (인증 필요)
     * POST /api/auth/logout
     * Header: Authorization: Bearer {accessToken}
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        authService.logout(authentication.getName()); // getName() = email
        return ResponseEntity.ok().build();
    }

    /**
     * 비밀번호 찾기 - 이름/별명/이메일 검증 후 재설정 메일 발송
     * POST /api/auth/password-reset
     * Body: { "name": "...", "nickname": "...", "email": "..." }
     */
    @PostMapping("/password-reset")
    public ResponseEntity<Void> requestPasswordReset(@RequestBody @Valid PasswordResetRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok().build();
    }

    /**
     * 비밀번호 재설정 확인 (토큰 검증 + 새 비밀번호 저장)
     * POST /api/auth/password-reset/confirm
     * Body: { "token": "...", "newPassword": "..." }
     */
    @PostMapping("/password-reset/confirm")
    public ResponseEntity<Void> confirmPasswordReset(@RequestBody @Valid PasswordResetConfirmRequest request) {
        authService.confirmPasswordReset(request);
        return ResponseEntity.ok().build();
    }
}