package com.egag.policy;

import com.egag.common.EmailService;
// import com.egag.auth.UserRepository; // 유저 목록 조회용 (가정)
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final EmailService emailService;
    // private final UserRepository userRepository;

    // 최신 정책 조회
    public Policy getLatestPolicy(String type) {
        return policyRepository.findFirstByTypeOrderByEffectiveDateDesc(type)
                .orElseThrow(() -> new RuntimeException("정책 정보가 없습니다."));
    }

    // 새 정책 등록 및 전체 메일 공지
    @Transactional
    public void updatePolicyAndNotify(Policy policy) {
        policyRepository.save(policy);

        // 실제 구현 시: 모든 유저 리스트를 가져와서 메일 발송
        // users.forEach(user ->
        //    emailService.sendPolicyChangeNotification(user.getEmail(), policy.getType(), policy.getEffectiveDate().toString())
        // );
    }
}