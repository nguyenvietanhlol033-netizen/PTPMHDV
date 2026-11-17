package com.cinema.booking.controller;

import com.cinema.booking.dto.PaymentCreateRequest;
import com.cinema.booking.dto.PaymentResponse;
import com.cinema.booking.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payment API", description = "Các endpoint quản lý và xử lý giao dịch thanh toán vé")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equals(a.getAuthority()));
    }

    @Operation(summary = "Khởi tạo giao dịch thanh toán cho danh sách vé")
    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentCreateRequest request,
                                                         @RequestAttribute("userId") Long userId) {
        PaymentResponse response = paymentService.createPayment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Xác nhận thanh toán giả lập cho đơn thanh toán (Dùng cho kiểm thử/Test)")
    @PostMapping("/{id}/mock-pay")
    public ResponseEntity<PaymentResponse> mockPay(@PathVariable Long id,
                                                  @RequestAttribute("userId") Long userId,
                                                  Authentication authentication) {
        PaymentResponse response = paymentService.processMockPayment(id, userId, isAdmin(authentication));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Thanh toán giả lập 1 chạm (Tạo đơn và hoàn tất thanh toán test ngay)")
    @PostMapping("/quick-mock")
    public ResponseEntity<PaymentResponse> quickMockPay(@Valid @RequestBody PaymentCreateRequest request,
                                                        @RequestAttribute("userId") Long userId,
                                                        Authentication authentication) {
        PaymentResponse response = paymentService.quickMockPayment(request, userId, isAdmin(authentication));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy thông tin chi tiết một giao dịch thanh toán")
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id,
                                                         @RequestAttribute("userId") Long userId,
                                                         Authentication authentication) {
        PaymentResponse response = paymentService.getPaymentById(id, userId, isAdmin(authentication));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy danh sách các giao dịch thanh toán của người dùng hiện tại")
    @GetMapping("/my-payments")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(@RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(paymentService.getMyPayments(userId));
    }

    @Operation(summary = "Hủy giao dịch thanh toán đang ở trạng thái PENDING")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<PaymentResponse> cancelPayment(@PathVariable Long id,
                                                        @RequestAttribute("userId") Long userId,
                                                        Authentication authentication) {
        PaymentResponse response = paymentService.cancelPayment(id, userId, isAdmin(authentication));
        return ResponseEntity.ok(response);
    }
}
