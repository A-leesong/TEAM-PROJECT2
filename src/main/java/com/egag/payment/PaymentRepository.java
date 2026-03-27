package com.egag.payment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, String> {

    List<Payment> findByUserId(String userId);
    Optional<Payment> findByImpUid(String impUid);
    Optional<Payment> findByMerchantUid(String merchantUid);

    @Query("SELECT SUM(p.amount) FROM Payment p")
    Long sumTotalAmount();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.createdAt >= :date")
    Long sumAmountByCreatedAtAfter(@Param("date") LocalDateTime date);

    // ── 어드민 리스트 조회 (페이징 & 검색) ──────────────────────
    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.user.nickname LIKE %:keyword% OR p.user.email LIKE %:keyword%")
    Page<Payment> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}