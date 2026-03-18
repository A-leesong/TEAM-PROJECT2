package com.egag.policy;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "policies") // 1. DB의 'policies' 테이블과 연결하기 위해 필수!
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // "TERMS" 또는 "PRIVACY"

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private String version; // 예: v1.0, v2.1

    // 2. DB의 'effective_date' 컬럼명과 정확히 매핑
    @Column(name = "effective_date", nullable = false)
    private LocalDateTime effectiveDate;

    // 3. DB의 'created_at' 컬럼명과 매핑
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}