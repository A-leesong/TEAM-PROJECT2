// D:\Works\TEAM-PROJECT2\src\main\java\com\egag\admin\AdminActionLogRepository.java
package com.egag.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Long> {
    // 기본 CRUD 메서드는 JpaRepository가 자동으로 제공합니다.
}