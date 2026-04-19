package com.cookingcooding.payment.repository;

import com.cookingcooding.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByImpUid(String impUid);
    boolean existsByImpUid(String impUid);
    List<Payment> findAllByOrderByPaidAtDesc();
}
