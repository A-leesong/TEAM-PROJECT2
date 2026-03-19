// com.egag.admin.AdminActionLog.java (새로 생성 추천)
package com.egag.admin;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class AdminActionLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String adminId;    // 관리자 ID
    private Long targetUserId; // 대상 유저 PK
    private String reason;     // 지급 사유 (결제 오류, 프로모션 등)
    private Integer amount;    // 지급된 토큰 수
    private LocalDateTime createdAt; // 일시
}