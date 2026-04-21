import axios from 'axios';

//Base URL of backend spring boot app - EmailOtpAuthenticationService
const BASE_URL = "http://localhost:8080/api/auth";

/**
 * Registr a new user.
 * Backend will send OTP to the email automatically.
 */

export const registerUser = async (name, email) => {
    const response = await axios.post(`${BASE_URL}/register`, {name, email});
    return response.data;

    //Returns: {success: true, message: "OTP sent to john@example.com"}
}

/**
 * Verify OTP entered by the user.
 * Return JWT token on success.
 */

 export const verifyOtp = async (email, otp) => {
     const response = await axios.post(`${BASE_URL}/verify-otp`, {email, otp});
     return response.data;

     //Returns: {token, email, name, message: "Login successful"}
}

/**
 * Send OTP to existing user (login flow)
 */
 export const sendLoginOtp = async (email) => {
     const response  = await axios.post(`${BASE_URL}/send-otp`, {email});
     return response.data;
}


