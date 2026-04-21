package com.auth.otp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OtpAuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OtpAuthServiceApplication.class, args);
    }
}
