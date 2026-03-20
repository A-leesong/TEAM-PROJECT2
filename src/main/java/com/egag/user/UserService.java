package com.egag.user;

import com.egag.payment.TokenLog; // 💡 실제 TokenLog 엔티티 위치에 맞춰 임포트하세요
import com.egag.payment.TokenLogRepository; // 💡 실제 Repository 위치에 맞춰 임포트하세요
import com.egag.common.domain.ArtworkRepository;
import com.egag.common.domain.User;
import com.egag.common.domain.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ArtworkRepository artworkRepository;
    private final FollowRepository followRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenLogRepository tokenLogRepository; // 🌟 추가: 토큰 로그 저장을 위한 의존성 주입

    @Value("${app.upload-dir:uploads/profiles}")
    private String uploadDir;

    public UserProfileResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return new UserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateMe(String email, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (req.getNickname() != null && !req.getNickname().isBlank()) {
            if (!req.getNickname().equals(user.getNickname())
                    && userRepository.existsByNickname(req.getNickname())) {
                throw new RuntimeException("이미 사용 중인 닉네임입니다.");
            }
            user.setNickname(req.getNickname());
        }
        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName());
        }
        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            user.setPhone(req.getPhone());
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()
                && !req.getEmail().equals(user.getSubEmail())) {
            if (userRepository.existsBySubEmail(req.getEmail())) {
                throw new RuntimeException("이미 사용 중인 이메일입니다.");
            }
            user.setSubEmail(req.getEmail());
        }

        return new UserProfileResponse(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse completeOnboarding(String email, OnboardingRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 🌟 최초 온보딩 여부 확인 (닉네임이 아직 없는 경우를 최초 가입자로 판단)
        boolean isFirstOnboarding = (user.getNickname() == null || user.getNickname().isBlank());

        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName());
        }
        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            user.setPhone(req.getPhone());
        }
        if (req.getNickname() != null && !req.getNickname().isBlank()) {
            if (!req.getNickname().equals(user.getNickname())
                    && userRepository.existsByNickname(req.getNickname())) {
                throw new RuntimeException("이미 사용 중인 닉네임입니다.");
            }
            user.setNickname(req.getNickname());
        }

        if (req.getEmail() != null && !req.getEmail().isBlank()
                && !req.getEmail().equals(user.getSubEmail())) {
            if (userRepository.existsBySubEmail(req.getEmail())) {
                throw new RuntimeException("이미 사용 중인 이메일입니다.");
            }
            user.setSubEmail(req.getEmail());
        }

        // 🌟 최초 가입 시에만 토큰 3개 지급 및 로그 저장
        if (isFirstOnboarding) {
            user.setTokenBalance(3);
            userRepository.save(user);

            TokenLog welcomeLog = TokenLog.builder()
                    .id(UUID.randomUUID().toString())
                    .user(user)
                    .amount(3)
                    .balanceAfter(user.getTokenBalance())
                    .type("WELCOME")
                    .reason("신규 가입 축하 토큰 3개 자동 지급")
                    .createdAt(LocalDateTime.now())
                    .build();

            tokenLogRepository.save(welcomeLog);
        }

        return new UserProfileResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (user.getPasswordHash() == null) {
            throw new RuntimeException("소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
        }
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("현재 비밀번호가 올바르지 않습니다.");
        }
        if (req.getNewPassword().length() < 8) {
            throw new RuntimeException("새 비밀번호는 8자 이상이어야 합니다.");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserProfileResponse uploadProfilePhoto(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);

            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf("."));
            }
            String filename = UUID.randomUUID() + ext;
            Files.write(dir.resolve(filename), file.getBytes());

            user.setProfileImageUrl("/uploads/profiles/" + filename);
            return new UserProfileResponse(userRepository.save(user));
        } catch (IOException e) {
            throw new RuntimeException("사진 업로드에 실패했습니다.");
        }
    }

    public List<ArtworkSummary> getMyArtworks(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return artworkRepository.findByUserId(user.getId()).stream()
                .map(ArtworkSummary::new)
                .collect(Collectors.toList());
    }
}