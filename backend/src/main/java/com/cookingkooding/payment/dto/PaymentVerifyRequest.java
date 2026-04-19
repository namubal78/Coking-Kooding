package com.cookingkooding.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class PaymentVerifyRequest {
    @NotBlank private String impUid;
    @NotBlank private String merchantUid;
    @NotNull  private Long amount;
    private String buyerName;
}
