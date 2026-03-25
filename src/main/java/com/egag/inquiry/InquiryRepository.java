package com.egag.inquiry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, String> {
    // 특정 유저의 문의 내역만 가져오는 기능 (마이페이지용)
    List<Inquiry> findByUserIdOrderByCreatedAtDesc(String userId);

    // 상태별 조회 (어드민용 - 페이징 추가)
    Page<Inquiry> findByStatusOrderByCreatedAtAsc(String status, Pageable pageable);
    
    // 전체 조회 (어드민용 - 페이징 추가)
    Page<Inquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 검색 기능 (제목 또는 내용 기반 - 페이징 추가)
    Page<Inquiry> findByTitleContainingOrContentContainingOrderByCreatedAtDesc(String title, String content, Pageable pageable);

    long countByStatus(String status);

    // 카테고리별 집계
    @Query("SELECT i.category, COUNT(i) FROM Inquiry i GROUP BY i.category")
    List<Object[]> countByCategory();
}