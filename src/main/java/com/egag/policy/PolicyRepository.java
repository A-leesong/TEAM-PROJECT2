package com.egag.policy;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    // 특정 타입의 가장 최근 등록된 정책 1건 조회
    Optional<Policy> findFirstByTypeOrderByEffectiveDateDesc(String type);
}