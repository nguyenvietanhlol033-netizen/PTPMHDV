package com.cinema.common.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Cơ chế thu hồi Token (Token Revocation) & Kiểm tra trạng thái người dùng tức thì:
 *  - Sử dụng Redis Blacklist để vô hiệu hóa token ngay khi logout hoặc bị revoke mà không cần chờ 15 phút hết hạn.
 *  - Hỗ trợ kiểm tra User bị vô hiệu hóa (disabled).
 */
@Service
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;

    @Autowired(required = false)
    public TokenBlacklistService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void blacklistToken(String token, long remainingSeconds) {
        if (redisTemplate != null && token != null && remainingSeconds > 0) {
            try {
                redisTemplate.opsForValue().set("jwt:blacklist:" + token, "revoked", Duration.ofSeconds(remainingSeconds));
            } catch (Exception ignored) {}
        }
    }

    public boolean isBlacklisted(String token) {
        if (redisTemplate == null || token == null) {
            return false;
        }
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey("jwt:blacklist:" + token));
        } catch (Exception e) {
            return false;
        }
    }

    public void disableUser(Long userId) {
        if (redisTemplate != null && userId != null) {
            try {
                redisTemplate.opsForValue().set("user:disabled:" + userId, "disabled", Duration.ofHours(24));
            } catch (Exception ignored) {}
        }
    }

    public void enableUser(Long userId) {
        if (redisTemplate != null && userId != null) {
            try {
                redisTemplate.delete("user:disabled:" + userId);
            } catch (Exception ignored) {}
        }
    }

    public boolean isUserDisabled(Long userId) {
        if (redisTemplate == null || userId == null) {
            return false;
        }
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey("user:disabled:" + userId));
        } catch (Exception e) {
            return false;
        }
    }
}
