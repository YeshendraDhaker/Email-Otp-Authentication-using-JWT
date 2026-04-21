package com.auth.otp.service;

import com.auth.otp.dto.*;
import com.auth.otp.model.OtpToken;
import com.auth.otp.model.User;
import com.auth.otp.repository.OtpTokenRepository;
import com.auth.otp.repository.UserRepository;
import com.auth.otp.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;

    /**
     * Register a new user and send OTP for email verification.
     */
    @Transactional
    public ApiResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered. Please login instead.");
        }

        // Send OTP immediately after registration
        otpService.generateAndSendOtp(request.getEmail(), request.getName());

        return new ApiResponse(true,
                "Registration successful! OTP sent to " + request.getEmail() + ". Please verify to login.");
    }

    /**
     * Send OTP to existing user for login.
     */
    public ApiResponse sendLoginOtp(SendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "No account found with email: " + request.getEmail() + ". Please register first."));

        otpService.generateAndSendOtp(request.getEmail(), user.getName());
        return new ApiResponse(true, "OTP sent to " + request.getEmail());
    }


    @Transactional
    public AuthResponse verifyOtpAndLogin(VerifyOtpRequest request) {
        // Step 1: verify OTP — throws if invalid
        otpService.verifyOtp(request.getEmail(), request.getOtp());

        // Step 2: check if user already exists (returning login user)
        // or create them now (first time registration)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    // ✅ First time — fetch name from otp_tokens and save user NOW
                    String name = otpTokenRepository
                            .findTopByEmailOrderByCreatedAtDesc(request.getEmail())
                            .map(OtpToken::getName)
                            .orElse("User");

                    return userRepository.save(User.builder()
                            .email(request.getEmail())
                            .name(name)
                            .verified(true)  // already verified
                            .build());
                });

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .message("Login successful!")
                .build();
    }
}
