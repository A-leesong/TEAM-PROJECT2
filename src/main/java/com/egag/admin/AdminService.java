package com.egag.admin;

import com.egag.admin.dto.*;
import com.egag.artwork.LikeRepository;
import com.egag.common.domain.Artwork;
import com.egag.common.domain.ArtworkRepository;
import com.egag.common.domain.User;
import com.egag.common.domain.UserRepository;
import com.egag.inquiry.InquiryRepository;
import com.egag.notification.NotificationRepository;
import com.egag.payment.PaymentRepository;
import com.egag.payment.TokenLogRepository;
import com.egag.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final TokenLogRepository tokenLogRepository;
    private final UserRepository userRepository;
    private final AdminActionLogRepository logRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final ArtworkRepository artworkRepository;
    private final InquiryRepository inquiryRepository;
    private final ReportRepository reportRepository;
    private final MainImageRepository mainImageRepository;
    private final LikeRepository likeRepository;

    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getRealDashboardStats() {
        long totalUsers = userRepository.count();
        LocalDateTime startOfToday = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        long todayNewUsers = userRepository.countByCreatedAtAfter(startOfToday);
        long suspendedUsers = userRepository.countByIsSuspended(Boolean.TRUE);

        Long totalSalesRaw = paymentRepository.sumTotalAmount();
        Long todaySalesRaw = paymentRepository.sumAmountByCreatedAtAfter(startOfToday);

        long totalSales = (totalSalesRaw != null) ? totalSalesRaw : 0L;
        long todaySales = (todaySalesRaw != null) ? todaySalesRaw : 0L;

        List<Artwork> trendingArtworks = artworkRepository.findByIsPublicTrueOrderByLikeCountDesc(PageRequest.of(0, 5));
        List<ArtworkStat> topArtworks = trendingArtworks.stream()
                .map(a -> ArtworkStat.builder()
                        .artworkId(a.getId())
                        .title(a.getTitle())
                        .author(a.getUser() != null ? a.getUser().getNickname() : "Unknown")
                        .likeCount(a.getLikeCount())
                        .imageUrl(a.getImageUrl())
                        .build())
                .collect(Collectors.toList());

        long activeArtworks = artworkRepository.count();
        long pendingInquiries = inquiryRepository.countByStatus("pending");

        return AdminDashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .todayNewUsers(todayNewUsers)
                .totalSales(totalSales)
                .todaySales(todaySales)
                .suspendedUsers(suspendedUsers)
                .activeUsers(totalUsers - suspendedUsers)
                .activeArtworks(activeArtworks)
                .pendingInquiries(pendingInquiries)
                .topArtworks(topArtworks)
                .build();
    }

    @Transactional
    public void toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 유저입니다."));
        boolean currentStatus = (user.getIsSuspended() != null && user.getIsSuspended());
        user.setIsSuspended(!currentStatus);
    }

    @Transactional(readOnly = true)
    public List<?> getAllTokenLogs() {
        return tokenLogRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void giveManualToken(String adminId, String userId, Integer amount, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 유저입니다."));

        user.addToken(amount);

        AdminActionLog adminLog = AdminActionLog.builder()
                .adminId(adminId)
                .targetUserId(userId)
                .targetNickname(user.getNickname())
                .amount(amount)
                .reason(reason)
                .createdAt(LocalDateTime.now())
                .build();
        logRepository.save(adminLog);

        com.egag.payment.TokenLog tokenLog = com.egag.payment.TokenLog.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .amount(amount)
                .balanceAfter(user.getTokenBalance())
                .type("MANUAL")
                .reason(reason)
                .createdAt(LocalDateTime.now())
                .build();
        tokenLogRepository.save(tokenLog);

        User admin = userRepository.findById(adminId).orElse(null);
        if (admin != null) {
            notificationService.createTokenNotification(user, admin, amount, reason);
        }
    }

    @Transactional(readOnly = true)
    public Page<AdminPaymentResponse> getAdminPayments(String keyword, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        Page<com.egag.payment.Payment> payments;
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        boolean hasDate = from != null && to != null;

        if (hasKeyword && hasDate) {
            payments = paymentRepository.searchByKeywordAndDateBetween(keyword.trim(), from, to, pageable);
        } else if (hasDate) {
            payments = paymentRepository.findByCreatedAtBetween(from, to, pageable);
        } else if (hasKeyword) {
            payments = paymentRepository.searchByKeyword(keyword.trim(), pageable);
        } else {
            payments = paymentRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return payments.map(AdminPaymentResponse::of);
    }

    @Transactional(readOnly = true)
    public long sumPaymentsBetween(LocalDateTime from, LocalDateTime to) {
        Long result = paymentRepository.sumAmountBetween(from, to);
        return result != null ? result : 0L;
    }

    @Transactional(readOnly = true)
    public Page<AdminReportResponse> getAdminReports(String status, String keyword, Pageable pageable) {
        Page<Report> reports;
        if (keyword != null && !keyword.trim().isEmpty()) {
            reports = reportRepository.findByReasonContainingOrArtworkTitleContaining(keyword.trim(), pageable);
        } else if ("pending".equals(status) || "resolved".equals(status)) {
            reports = reportRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else {
            reports = reportRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return reports.map(AdminReportResponse::from);
    }

    @Transactional
    public void resolveReport(String reportId, User admin) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("신고를 찾을 수 없습니다."));
        report.setStatus("resolved");
        report.setResolvedBy(admin);
        report.setResolvedAt(LocalDateTime.now());
        reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public List<MainBannerResponse> getMainImages() {
        List<MainBannerResponse> responses = new java.util.ArrayList<>();
        for (int i = 0; i < 10; i++) {
            final int slot = i;
            MainBannerResponse res = mainImageRepository.findBySlotNumber(slot)
                    .map(MainBannerResponse::from)
                    .orElse(MainBannerResponse.builder().slotNumber(slot).build());
            responses.add(res);
        }
        return responses;
    }

    @Transactional
    public void assignMainImage(String artworkId, Integer slotNumber) {
        Artwork artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new RuntimeException("작품을 찾을 수 없습니다."));
        
        MainImage mainImage = mainImageRepository.findBySlotNumber(slotNumber)
                .orElse(MainImage.builder().slotNumber(slotNumber).build());
        
        String imageUrl = artwork.getImageUrl();
        if (imageUrl == null || imageUrl.isEmpty()) {
            imageUrl = artwork.getUserImageData();
        }
        
        if (imageUrl == null || imageUrl.isEmpty()) {
            throw new RuntimeException("작품에 유효한 이미지가 없습니다. (ID: " + artworkId + ")");
        }

        mainImage.setArtwork(artwork);
        mainImage.setImageUrl(imageUrl);
        mainImageRepository.save(mainImage);
    }

    @Transactional
    public void clearMainImageSlot(Integer slotNumber) {
        mainImageRepository.findBySlotNumber(slotNumber)
                .ifPresent(mainImageRepository::delete);
    }

    @Transactional
    public void deleteArtwork(String artworkId) {
        likeRepository.deleteByArtworkId(artworkId);
        reportRepository.deleteByArtworkId(artworkId);
        notificationRepository.deleteByArtworkId(artworkId);
        artworkRepository.deleteById(artworkId);
    }

    @Transactional
    public void toggleArtworkVisibility(String artworkId) {
        Artwork artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new RuntimeException("작품을 찾을 수 없습니다."));
        artwork.setIsPublic(!artwork.getIsPublic());
    }

    @Transactional(readOnly = true)
    public Page<AdminArtworkResponse> getAdminArtworks(Pageable pageable) {
        return artworkRepository.findAllWithUserOrderByLikeCountDesc(pageable).map(a -> {
            String imageUrl = a.getImageUrl();
            if (imageUrl == null || imageUrl.isEmpty()) {
                imageUrl = a.getUserImageData();
            }
            return AdminArtworkResponse.builder()
                    .id(a.getId())
                    .title(a.getTitle())
                    .imageUrl(imageUrl)
                    .nickname(a.getUser() != null ? a.getUser().getNickname() : "Unknown")
                    .isVisible(a.getIsPublic())
                    .createdAt(a.getCreatedAt())
                    .likeCount(a.getLikeCount() != null ? a.getLikeCount() : 0)
                    .build();
        });
    }
}