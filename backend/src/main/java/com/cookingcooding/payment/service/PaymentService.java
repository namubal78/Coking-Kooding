package com.cookingcooding.payment.service;

import com.cookingcooding.payment.dto.PaymentVerifyRequest;
import com.cookingcooding.payment.entity.Payment;
import com.cookingcooding.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public List<Payment> getAll() {
        return paymentRepository.findAllByOrderByPaidAtDesc();
    }

    public Payment verify(PaymentVerifyRequest req) {
        if (paymentRepository.existsByImpUid(req.getImpUid())) {
            throw new IllegalArgumentException("이미 처리된 결제입니다.");
        }
        // 실제 환경에서는 여기서 포트원 API로 실제 결제 금액 검증
        return paymentRepository.save(Payment.builder()
                .impUid(req.getImpUid())
                .merchantUid(req.getMerchantUid())
                .amount(req.getAmount())
                .buyerName(req.getBuyerName())
                .status(Payment.Status.PAID)
                .build());
    }
}
