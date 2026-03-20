package com.egag.auth;

import com.egag.common.domain.User;
import com.egag.common.domain.UserRepository;
import com.egag.common.exception.CustomException;
import com.egag.payment.TokenLog; // ✅ 패키지 경로 확인 필요
import com.egag.payment.TokenLogRepository; // ✅ 패키지 경로 확인 필요
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TokenLogRepository tokenLogRepository; // 🌟 추가: 토큰 로그 저장을 위한 의존성 주입

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExpiration; // 밀리초 단위 (예: 604800000 = 7일)

    // ─────────────────────────────────────────
    // Spring Security UserDetailsService 구현
    // ─────────────────────────────────────────

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash() != null ? user.getPasswordHash() : "")
                .roles(user.getRole() != null ? user.getRole() : "USER")
                .build();
    }

    // ─────────────────────────────────────────
    // 회원가입
    // ─────────────────────────────────────────

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        String nickname = request.getNickname();
        if (nickname != null && nickname.length() > 12) {
            nickname = nickname.substring(0, 12);
        }

        if (nickname != null && userRepository.existsByNickname(nickname)) {
            throw new IllegalArgumentException("이미 사용 중인 별명입니다.");
        }

        // 🌟 1. 유저 생성 시 토큰 3개 기본 지급 및 역할 설정
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .email(request.getEmail())
                .name(request.getName())
                .phone(request.getPhone())
                .nickname(nickname)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .tokenBalance(3) // 기본 토큰 지급
                .role("USER")    // 기본 역할 명시
                .build();

        User savedUser = userRepository.save(user);

        // 🌟 2. 가입 즉시 변동 이력(TokenLog) 저장 (어드민 대시보드 표시용)
        tokenLogRepository.save(TokenLog.builder()
                .id(UUID.randomUUID().toString())
                .user(savedUser)
                .amount(3)
                .balanceAfter(3)
                .type("WELCOME")
                .reason("신규 가입 축하 토큰 3개 자동 지급")
                .createdAt(LocalDateTime.now())
                .build());

        return generateTokenPair(savedUser);
    }

    // ─────────────────────────────────────────
    // 로그인
    // ─────────────────────────────────────────

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return generateTokenPair(user);
    }

    // ─────────────────────────────────────────
    // Access Token 재발급 (Refresh Token 사용)
    // ─────────────────────────────────────────

    @Transactional
    public TokenResponse reissue(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 Refresh Token입니다."));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh Token이 만료되었습니다. 다시 로그인해주세요.");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(refreshToken.getUser().getEmail());
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpiration));
        refreshTokenRepository.save(refreshToken);

        User u = refreshToken.getUser();
        return new TokenResponse(newAccessToken, refreshToken.getToken(),
                u.getId(), u.getNickname(), u.getRole(), u.getTokenBalance(), false);
    }

    // ─────────────────────────────────────────
    // 로그아웃 (Refresh Token 삭제)
    // ─────────────────────────────────────────

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
        refreshTokenRepository.deleteByUser(user);
    }

    // ─────────────────────────────────────────
    // 비밀번호 찾기 (이름/별명/이메일 검증 후 메일 발송)
    // ─────────────────────────────────────────

    @Transactional
    public void requestPasswordReset(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(
                        HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                        "입력하신 이메일로 가입된 계정이 없습니다."));

        if (!user.getName().equals(request.getName())) {
            throw new CustomException(
                    HttpStatus.BAD_REQUEST, "NAME_MISMATCH",
                    "입력하신 이름이 계정 정보와 일치하지 않습니다.");
        }

        if (!user.getNickname().equals(request.getNickname())) {
            throw new CustomException(
                    HttpStatus.BAD_REQUEST, "NICKNAME_MISMATCH",
                    "입력하신 별명이 계정 정보와 일치하지 않습니다.");
        }

        passwordResetTokenRepository.deleteByUser(user);
        String token = UUID.randomUUID().toString();
        passwordResetTokenRepository.save(
                PasswordResetToken.builder()
                        .user(user)
                        .token(token)
                        .expiryDate(LocalDateTime.now().plusMinutes(30))
                        .build());

        String sendTo = (user.getSubEmail() != null && !user.getSubEmail().isBlank())
                ? user.getSubEmail() : user.getEmail();
        emailService.sendPasswordResetEmail(sendTo, user.getNickname(), token);
    }

    // ─────────────────────────────────────────
    // 비밀번호 재설정 확인 (토큰 검증 + 비밀번호 변경)
    // ─────────────────────────────────────────

    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new CustomException(
                        HttpStatus.BAD_REQUEST, "INVALID_TOKEN",
                        "유효하지 않은 토큰입니다."));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new CustomException(
                    HttpStatus.BAD_REQUEST, "TOKEN_EXPIRED",
                    "만료된 토큰입니다. 비밀번호 찾기를 다시 시도해주세요.");
        }

        if (resetToken.isUsed()) {
            throw new CustomException(
                    HttpStatus.BAD_REQUEST, "TOKEN_ALREADY_USED",
                    "이미 사용된 토큰입니다. 비밀번호 찾기를 다시 시도해주세요.");
        }

        String newPassword = request.getNewPassword();
        if (!newPassword.matches(".*[A-Za-z].*") || !newPassword.matches(".*[0-9].*")) {
            throw new CustomException(
                    HttpStatus.BAD_REQUEST, "INVALID_PASSWORD",
                    "비밀번호는 영문과 숫자를 모두 포함해야 합니다.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    // ─────────────────────────────────────────
    // 내부 공통: 토큰 쌍 생성
    // ─────────────────────────────────────────

    private TokenResponse generateTokenPair(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());

        RefreshToken refreshToken = refreshTokenRepository.findByUser(user)
                .orElse(new RefreshToken());
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpiration));
        refreshTokenRepository.save(refreshToken);

        return new TokenResponse(accessToken, refreshToken.getToken(),
                user.getId(), user.getNickname(), user.getRole(), user.getTokenBalance(), false);
    }
}