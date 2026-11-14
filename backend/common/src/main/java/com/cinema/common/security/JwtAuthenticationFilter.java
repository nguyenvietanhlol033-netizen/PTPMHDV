package com.cinema.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, TokenBlacklistService tokenBlacklistService) {
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        SecurityContextHolder.clearContext();
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // Kiểm tra Token Revocation (nếu token đã bị đưa vào Redis Blacklist)
            if (tokenBlacklistService.isBlacklisted(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write(String.format(
                        "{\"timestamp\":\"%s\",\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Token đã bị thu hồi hoặc đã đăng xuất\",\"path\":\"%s\"}",
                        java.time.LocalDateTime.now(), request.getRequestURI()));
                return;
            }

            if (jwtUtil.validateToken(token)) {
                Long userId = jwtUtil.extractUserId(token);
                // Kiểm tra xem User có bị Admin vô hiệu hóa tức thì không
                if (userId != null && tokenBlacklistService.isUserDisabled(userId)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write(String.format(
                            "{\"timestamp\":\"%s\",\"status\":403,\"error\":\"Forbidden\",\"message\":\"Tài khoản người dùng đã bị vô hiệu hóa\",\"path\":\"%s\"}",
                            java.time.LocalDateTime.now(), request.getRequestURI()));
                    return;
                }

                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);

                if (username == null || userId == null
                        || (!"ADMIN".equals(role) && !"CUSTOMER".equals(role) && !"USER".equals(role))) {
                    filterChain.doFilter(request, response);
                    return;
                }
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Controller lấy bằng @RequestAttribute("userId") Long userId
                request.setAttribute("userId", userId);
            }
        }
        filterChain.doFilter(request, response);
    }
}
