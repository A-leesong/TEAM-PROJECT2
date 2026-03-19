package com.egag.payment;

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

    // 📊 [추가] 전체 매출 합계 (null일 경우 0L 반환)
    @Query("SELECT SUM(p.amount) FROM Payment p")
    Long sumTotalAmount();

    // 🗓️ [추가] 오늘 매출 합계
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.createdAt >= :date")
    Long sumAmountByCreatedAtAfter(@Param("date") LocalDateTime date);
}