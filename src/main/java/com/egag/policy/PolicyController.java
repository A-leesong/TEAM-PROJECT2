package com.egag.policy;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/policy")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @GetMapping("/terms")
    public ResponseEntity<Policy> getTerms() {
        return ResponseEntity.ok(policyService.getLatestPolicy("TERMS"));
    }

    @GetMapping("/privacy")
    public ResponseEntity<Policy> getPrivacy() {
        return ResponseEntity.ok(policyService.getLatestPolicy("PRIVACY"));
    }
}
