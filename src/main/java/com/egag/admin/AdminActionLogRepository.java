package com.egag.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Long> {
    // 최신순 정렬을 위한 메서드
    List<AdminActionLog> findAllByOrderByCreatedAtDesc();
}