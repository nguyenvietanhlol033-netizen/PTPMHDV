package com.cinema.user.controller;

import com.cinema.common.exception.ConflictException;
import com.cinema.common.security.JwtUtil;
import com.cinema.common.security.TokenBlacklistService;
import com.cinema.user.dto.AuthResponse;
import com.cinema.user.dto.LoginRequest;
import com.cinema.user.dto.RegisterRequest;
import com.cinema.user.model.Role;
import com.cinema.user.model.User;
import com.cinema.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
                          UserRepository userRepository, PasswordEncoder passwordEncoder,
                          TokenBlacklistService tokenBlacklistService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        // Kiểm tra tài khoản và mật khẩu
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Lấy thông tin user từ DB để lấy Role
        User user = userRepository.findByUsername(request.getUsername()).get();

        // Tạo JWT Token (token giờ có thêm userId)
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());

        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // Kiểm tra xem username đã tồn tại trong DB chưa
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ConflictException("Tên đăng nhập đã tồn tại trong hệ thống");
        }

        // Tạo tài khoản mới, mã hóa mật khẩu và gán quyền CUSTOMER mặc định
        User newUser = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                Role.CUSTOMER
        );

        userRepository.save(newUser);
        return ResponseEntity.ok(java.util.Map.of("message", "Đăng ký tài khoản thành công!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            long remaining = jwtUtil.getRemainingSeconds(token);
            tokenBlacklistService.blacklistToken(token, remaining);
        }
        return ResponseEntity.ok(java.util.Map.of("message", "Đăng xuất thành công, Token đã được thu hồi"));
    }
}
