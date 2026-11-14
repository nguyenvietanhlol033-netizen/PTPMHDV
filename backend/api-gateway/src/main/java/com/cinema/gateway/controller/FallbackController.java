package com.cinema.gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class FallbackController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
            "service", "Cinema API Gateway",
            "port", 8080,
            "status", "UP",
            "message", "Cinema System Gateway is active and routing requests"
        ));
    }

    @GetMapping("/fallback")
    public ResponseEntity<Map<String, Object>> fallback() {
        return ResponseEntity.status(503).body(Map.of(
            "status", 503,
            "error", "Service Unavailable",
            "message", "Dịch vụ đích tạm thời không khả dụng qua API Gateway"
        ));
    }
}
