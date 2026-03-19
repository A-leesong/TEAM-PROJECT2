package com.egag.admin;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder // ✅ AdminService에서 .builder()를 쓰려면 필요합니다.
@AllArgsConstructor // ✅ Builder 사용 시 필수
@NoArgsConstructor  // ✅ JPA 엔티티 필수
public class AdminActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String adminId;      // 관리자 ID
    private String targetUserId;   // 대상 유저 PK

    private String targetNickname; // ✅ [추가] 대상 유저 닉네임 (프론트 표시용)

    private String reason;       // 지급 사유
    private Integer amount;      // 지급된 토큰 수

    private LocalDateTime createdAt; // 일시

    // 엔티티가 저장되기 직전에 시간을 자동으로 넣어줍니다.
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}