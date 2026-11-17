package com.cinema.booking.repository;

import com.cinema.booking.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionCode(String transactionCode);
    Optional<Payment> findByUserIdAndIdempotencyKey(Long userId, String idempotencyKey);
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);
}
