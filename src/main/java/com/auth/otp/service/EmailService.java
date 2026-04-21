package com.auth.otp.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Your OTP Code - Login Verification");
            helper.setText(buildEmailBody(name, otp), true); // true = HTML

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        }
    }

    private String buildEmailBody(String name, String otp) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 520px; margin: 40px auto; background: #ffffff;
                                     border-radius: 10px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h2 { color: #333333; }
                        .otp-box { background: #f0f4ff; border: 2px dashed #4f46e5;
                                   border-radius: 8px; text-align: center; padding: 20px; margin: 20px 0; }
                        .otp-code { font-size: 42px; font-weight: bold; color: #4f46e5; letter-spacing: 8px; }
                        .note { color: #666666; font-size: 14px; margin-top: 20px; }
                        .warning { color: #e53e3e; font-size: 13px; margin-top: 10px; }
                        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🔐 Login Verification</h2>
                        </div>
                        <p>Hi <strong>%s</strong>,</p>
                        <p>Use the OTP code below to complete your login. This code is valid for <strong>5 minutes</strong>.</p>
                        <div class="otp-box">
                            <div class="otp-code">%s</div>
                        </div>
                        <p class="note">Enter this code on the verification page to sign in to your account.</p>
                        <p class="warning">⚠️ Do NOT share this code with anyone. We will never ask for your OTP.</p>
                        <div class="footer">
                            <p>If you didn't request this, please ignore this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(name, otp);
    }
}
