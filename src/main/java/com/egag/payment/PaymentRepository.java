package com.egag.payment;

import com.egag.admin.dto.ProductStat;  // ✅ 독립시킨 클래스 임포트
import com.egag.admin.dto.PaymentStat;  // ✅ 독립시킨 클래스 임포트
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

    // 🔥 인기 패키지 순위 (ProductStat 클래스 직접 사용)
    @Query("SELECT new com.egag.admin.dto.ProductStat(p.packageName, COUNT(p)) " +
            "FROM Payment p GROUP BY p.packageName ORDER BY COUNT(p) DESC")
    List<ProductStat> findTopProducts();

    // 💳 결제 수단 비율 (PaymentStat 클래스 직접 사용)
    @Query("SELECT new com.egag.admin.dto.PaymentStat(p.payMethod, COUNT(p)) " +
            "FROM Payment p GROUP BY p.payMethod")
    List<PaymentStat> findPaymentMethodRatio();
}