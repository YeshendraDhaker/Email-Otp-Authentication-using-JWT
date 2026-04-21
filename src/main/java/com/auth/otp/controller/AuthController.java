package com.auth.otp.controller;

import com.auth.otp.dto.*;
import com.auth.otp.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Register a new user (sends OTP to email automatically).
     *
     * Body: { "name": "John Doe", "email": "john@example.com" }
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * POST /api/auth/send-otp
     * Send OTP to a registered user's email (for login).
     *
     * Body: { "email": "john@example.com" }
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        return ResponseEntity.ok(authService.sendLoginOtp(request));
    }

    /**
     * POST /api/auth/verify-otp
     * Verify OTP and receive JWT token.
     *
     * Body: { "email": "john@example.com", "otp": "123456" }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtpAndLogin(request));
    }

    /**
     * GET /api/auth/health
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse> health() {
        return ResponseEntity.ok(new ApiResponse(true, "OTP Auth Service is running!"));
    }
}
