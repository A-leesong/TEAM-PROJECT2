package com.egag.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, String> {
    boolean existsByReporterIdAndArtworkId(String reporterId, String artworkId);
    
    // 상태별 조회 (페이징 추가)
    Page<Report> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    
    // 전체 조회 (페이징 추가)
    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 검색 기능 (사유 또는 작품 제목 기반 - 페이징 추가)
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Report r LEFT JOIN r.artwork a " +
           "WHERE r.reason LIKE %:keyword% OR a.title LIKE %:keyword% " +
           "ORDER BY r.createdAt DESC")
    Page<Report> findByReasonContainingOrArtworkTitleContaining(@org.springframework.data.repository.query.Param("keyword") String keyword, Pageable pageable);

    void deleteByArtworkId(String artworkId);
}
