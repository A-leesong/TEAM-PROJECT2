package com.egag.inquiry;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, String> {
    // 특정 유저의 문의 내역만 가져오는 기능 (마이페이지용)
    List<Inquiry> findByUserIdOrderByCreatedAtDesc(String userId);

    // 상태별 조회 (어드민용)
    List<Inquiry> findByStatusOrderByCreatedAtAsc(String status);
    List<Inquiry> findAllByOrderByCreatedAtDesc();

    // 카테고리별 집계
    @Query("SELECT i.category, COUNT(i) FROM Inquiry i GROUP BY i.category")
    List<Object[]> countByCategory();
}