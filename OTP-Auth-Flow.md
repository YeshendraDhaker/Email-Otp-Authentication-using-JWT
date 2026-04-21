# OTP Authentication Flow — Complete Guide

---

## 1. Registration Flow

```
User submits name + email
        ↓
POST /api/auth/register
{ "name": "John Doe", "email": "john@example.com" }
        ↓
AuthController.register()
        ↓
AuthService.register()
        │
        ├─ 1. Check if email already exists in DB
        │        └─ If yes → throw "Email already registered"
        │
        ├─ 2. Create new User object
        │        ├─ name  = "John Doe"
        │        ├─ email = "john@example.com"
        │        └─ verified = false
        │
        ├─ 3. Save User to DB (users table)
        │
        └─ 4. Call OtpService.generateAndSendOtp(email)
                 │
                 ├─ OtpGenerator.generate() → "482951"  (SecureRandom, 6 digits)
                 ├─ Delete any old OTPs for this email
                 ├─ Save new OtpToken to DB
                 │      ├─ email      = "john@example.com"
                 │      ├─ otp        = "482951"
                 │      ├─ expiresAt  = now + 5 minutes
                 │      ├─ used       = false
                 │      └─ attempts   = 0
                 └─ EmailService.sendOtpEmail() → sends HTML email via Gmail SMTP
        ↓
Response:
{
  "success": true,
  "message": "Registration successful! OTP sent to john@example.com."
}
```

---

## 2. Login Flow (Returning User)

```
User enters their email
        ↓
POST /api/auth/send-otp
{ "email": "john@example.com" }
        ↓
AuthController.sendOtp()
        ↓
AuthService.sendLoginOtp()
        │
        ├─ 1. Check user exists in DB
        │        └─ If not → throw "No account found, please register"
        │
        └─ 2. OtpService.generateAndSendOtp(email)
                 │
                 ├─ Delete old OTPs for this email
                 ├─ Generate new 6-digit OTP via SecureRandom
                 ├─ Save to otp_tokens table (expires in 5 min)
                 └─ Send HTML email with OTP code
        ↓
Response:
{
  "success": true,
  "message": "OTP sent to john@example.com"
}
```

---

## 3. OTP Verification + JWT Issuance Flow

```
User enters the OTP from email
        ↓
POST /api/auth/verify-otp
{ "email": "john@example.com", "otp": "482951" }
        ↓
AuthController.verifyOtpAndLogin()
        ↓
AuthService.verifyOtpAndLogin()
        │
        ├─ 1. OtpService.verifyOtp(email, otp)
        │        │
        │        ├─ Find latest unused OTP for email in DB
        │        │       └─ If not found → throw "No active OTP found"
        │        │
        │        ├─ Check: is OTP expired?  (expiresAt < now)
        │        │       └─ If yes → delete it, throw "OTP has expired"
        │        │
        │        ├─ Check: attempts >= 3?
        │        │       └─ If yes → delete it, throw "Max attempts exceeded"
        │        │
        │        ├─ Check: inputOtp == storedOtp?
        │        │       └─ If no  → increment attemptCount, throw "Invalid OTP, X remaining"
        │        │
        │        ├─ Mark OTP as used = true  → save to DB
        │        └─ Mark user.verified = true → save to DB
        │
        ├─ 2. Fetch User from DB by email
        │
        └─ 3. JwtUtil.generateToken(email)
                 │
                 ├─ Sets subject    = "john@example.com"
                 ├─ Sets issuedAt   = current timestamp
                 ├─ Sets expiration = now + 24 hours
                 ├─ Signs with HS256 + secret key
                 └─ Returns compact JWT string
        ↓
Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIn0...",
  "email": "john@example.com",
  "name":  "John Doe",
  "message": "Login successful!"
}
```

---

## 4. What's Inside the JWT

The token is 3 Base64-encoded parts joined by dots:

```
eyJhbGciOiJIUzI1NiJ9           ← Part 1: Header
.eyJzdWIiOiJqb2huQGV4YW1...    ← Part 2: Payload
.SflKxwRJSMeKKF2QT4fwpM...     ← Part 3: Signature
```

Decoded payload:
```json
{
  "sub": "john@example.com",
  "iat": 1710000000,
  "exp": 1710086400
}
```

| Field | Meaning                        |
|-------|-------------------------------|
| sub   | Subject — the user's email     |
| iat   | Issued At — Unix timestamp     |
| exp   | Expiry — iat + 24 hours        |

---

## 5. Using the JWT on Protected Routes

Once the user has the token, every request to a protected endpoint must include it:

```http
GET /api/some-protected-route
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

The backend validates it with `JwtUtil`:

```
Incoming request with Authorization header
        ↓
JwtUtil.validateToken(token)
        ├─ Parse and verify signature using secret key
        ├─ Check token is not expired
        └─ Return true / false
        ↓
JwtUtil.extractEmail(token)
        └─ Returns "john@example.com" from the "sub" claim
        ↓
User is identified — request proceeds
```

---

## 6. OTP Security Rules

| Rule            | Value                                      |
|-----------------|--------------------------------------------|
| OTP Length      | 6 digits                                   |
| Generator       | `SecureRandom` (cryptographically secure)  |
| Expiry          | 5 minutes                                  |
| Max Attempts    | 3 tries                                    |
| After 3 fails   | OTP deleted, must request new one          |
| After expiry    | OTP deleted automatically (scheduled job)  |
| One-time use    | Marked `used=true` after success           |
| Old OTPs        | Deleted when a new OTP is requested        |

---

## 7. Complete Mental Model

```
OTP  →  proves you own the email  →  one-time, short-lived  (5 min)
JWT  →  proves you are logged in  →  reusable, longer-lived (24 hrs)
```

```
REGISTER ──► save user ──► send OTP ──► verify OTP ──► JWT
                                                         │
LOGIN    ──► send OTP  ──► verify OTP ──► JWT ───────────┘
                                                         │
                                              use JWT on all
                                              protected routes
```

---

## 8. Database Tables

### `users`
| Column     | Type    | Notes                  |
|------------|---------|------------------------|
| id         | BIGINT  | Primary key            |
| email      | VARCHAR | Unique                 |
| name       | VARCHAR |                        |
| verified   | BOOLEAN | true after OTP success |
| created_at | DATETIME|                        |

### `otp_tokens`
| Column        | Type     | Notes                     |
|---------------|----------|---------------------------|
| id            | BIGINT   | Primary key               |
| email         | VARCHAR  |                           |
| otp           | VARCHAR  | 6-digit code              |
| expires_at    | DATETIME | now + 5 minutes           |
| used          | BOOLEAN  | true after verification   |
| attempt_count | INT      | max 3 before invalidation |
| created_at    | DATETIME |                           |
