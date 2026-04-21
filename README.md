# OTP-Based Authentication Service 🔐

A Spring Boot application for email OTP-based authentication. Users register, receive a 6-digit OTP via email, verify it, and get a JWT token.

---

## 🏗️ Project Structure

```
src/main/java/com/auth/otp/
├── OtpAuthServiceApplication.java     ← Main class
├── model/
│   ├── User.java                      ← User entity
│   └── OtpToken.java                  ← OTP record entity
├── repository/
│   ├── UserRepository.java
│   └── OtpTokenRepository.java
├── dto/
│   ├── RegisterRequest.java
│   ├── SendOtpRequest.java
│   ├── VerifyOtpRequest.java
│   ├── AuthResponse.java
│   └── ApiResponse.java
├── service/
│   ├── AuthService.java               ← Register, login logic
│   ├── OtpService.java                ← OTP generate/verify
│   └── EmailService.java              ← Gmail SMTP sender
├── util/
│   ├── OtpGenerator.java              ← Secure random OTP
│   └── JwtUtil.java                   ← JWT create/validate
└── config/
    ├── SecurityConfig.java            ← Spring Security (stateless)
    └── GlobalExceptionHandler.java    ← Unified error responses
```

---

## ⚙️ Setup

### 1. Configure Gmail SMTP

In `src/main/resources/application.properties`:

```properties
spring.mail.username=YOUR_GMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD
```

> **Important:** Use a **Gmail App Password**, NOT your regular Gmail password.
> To create one: Google Account → Security → 2-Step Verification → App Passwords

### 2. Set JWT Secret

```properties
jwt.secret=your-very-long-secret-key-at-least-32-chars-long
```

### 3. (Optional) Switch to MySQL/PostgreSQL

Replace H2 config in `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/otpdb
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```

And add MySQL dependency to `pom.xml`:
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
</dependency>
```

---

## 🚀 Run the App

```bash
mvn spring-boot:run
```

App starts at: `http://localhost:8080`

---

## 📡 API Endpoints

### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Registration successful! OTP sent to john@example.com. Please verify to login."
}
```

---

### 2. Send OTP (Login)
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```
**Response:**
```json
{
  "success": true,
  "message": "OTP sent to john@example.com"
}
```

---

### 3. Verify OTP → Get JWT
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "482951"
}
```
**Response:**
```json
{
  "token": "eyJhbGci...",
  "email": "john@example.com",
  "name": "John Doe",
  "message": "Login successful!"
}
```

---

### 4. Health Check
```http
GET /api/auth/health
```

---

## 🔒 OTP Security Rules

| Rule               | Value            |
|--------------------|------------------|
| OTP Length         | 6 digits         |
| Expiry             | 5 minutes        |
| Max Attempts       | 3 tries          |
| Algorithm          | SecureRandom     |
| After max attempts | OTP invalidated  |
| After expiry       | OTP deleted      |

---

## 🔄 Authentication Flow

```
1. POST /register      → User saved, OTP sent to email
          ↓
2. User checks email → Gets 6-digit OTP
          ↓
3. POST /verify-otp  → OTP validated → JWT returned
          ↓
4. Use JWT token in Authorization: Bearer <token> for protected routes

For returning users:
1. POST /send-otp    → New OTP sent
2. POST /verify-otp  → JWT returned
```

---

## 🛠️ Tech Stack

- **Java 17** + **Spring Boot 3.2**
- **Spring Security** (stateless, JWT)
- **Spring Mail** (Gmail SMTP)
- **Spring Data JPA** (H2 / MySQL)
- **JJWT 0.11.5** for JWT
- **Lombok** for boilerplate reduction
