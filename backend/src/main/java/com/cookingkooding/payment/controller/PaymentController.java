package com.cookingkooding.payment.controller;

import com.cookingkooding.payment.dto.PaymentVerifyRequest;
import com.cookingkooding.payment.entity.Payment;
import com.cookingkooding.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getAll() {
        return ResponseEntity.ok(paymentService.getAll());
    }

    @PostMapping("/verify")
    public ResponseEntity<Payment> verify(@Valid @RequestBody PaymentVerifyRequest req) {
        return ResponseEntity.ok(paymentService.verify(req));
    }
}
