package com.auth.otp.service;

import com.auth.otp.model.OtpToken;
import com.auth.otp.model.User;
import com.auth.otp.repository.OtpTokenRepository;
import com.auth.otp.repository.UserRepository;
import com.auth.otp.util.OtpGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final UserRepository userRepository;
    private final OtpGenerator otpGenerator;
    private final EmailService emailService;

    @Value("${otp.expiry.minutes:5}")
    private int otpExpiryMinutes;

    private static final int MAX_ATTEMPTS = 3;

    /**
     * Generate and send a fresh OTP for the given email.
     * Invalidates any previously active OTPs for that email.
     */
    @Transactional
    public void generateAndSendOtp(String email, String name) {

        // Invalidate old OTPs
        otpTokenRepository.deleteAllByEmail(email);

        String otp = otpGenerator.generate();

        OtpToken token = OtpToken.builder()
                .email(email)
                .name(name)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .used(false)
                .attemptCount(0)
                .build();

        otpTokenRepository.save(token);

        emailService.sendOtpEmail(email, otp, name);
        log.info("OTP generated and sent to: {}", email);
    }

    /**
     * Validate the OTP entered by the user.
     * Returns true on success, throws exception on failure.
     */
    @Transactional
    public boolean verifyOtp(String email, String inputOtp) {
        OtpToken token = otpTokenRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException("No active OTP found. Please request a new one."));

        if (token.isExpired()) {
            otpTokenRepository.delete(token);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (token.getAttemptCount() >= MAX_ATTEMPTS) {
            otpTokenRepository.delete(token);
            throw new RuntimeException("Maximum attempts exceeded. Please request a new OTP.");
        }

        if (!token.getOtp().equals(inputOtp)) {
            token.setAttemptCount(token.getAttemptCount() + 1);
            otpTokenRepository.save(token);
            int remaining = MAX_ATTEMPTS - token.getAttemptCount();
            throw new RuntimeException("Invalid OTP. " + remaining + " attempt(s) remaining.");
        }

        // Mark OTP as used
        token.setUsed(true);
        otpTokenRepository.save(token);

        log.info("OTP verified successfully for: {}", email);
        return true;
    }

    /**
     * Clean up expired OTPs every 10 minutes.
     */
    @Scheduled(fixedRate = 600_000)
    public void cleanExpiredOtps() {
        otpTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.debug("Expired OTPs cleaned up.");
    }
}
