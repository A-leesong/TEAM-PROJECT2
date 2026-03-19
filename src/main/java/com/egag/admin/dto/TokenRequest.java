package com.egag.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenRequest {
    private String userId;
    private Integer amount;
    private String reason;
}