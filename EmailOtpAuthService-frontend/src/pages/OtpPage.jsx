import {verifyOtp} from "../api/authApi.js";
import {useEffect, useRef, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";

function OtpPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get email passed from RegisterPage
    const email = location.state?.email;

    const[otp, setOtp] = useState(['', '', '', '', '', '']);
    const[error, setError] = useState('');
    const[loading, setLoading] = useState(false);

    // Refs for each input so we can autp-focus
    const inputRefs = useRef([]);

    // If no email in state, redirect back to register
    useEffect(() => {
        if(!email) navigate('/');
    }, [email, navigate]);

    //Auto-focus the first box on page load
    useEffect(() => {
        inputRefs.current[0]?.focus();
    },[]);

    const handleChange = (index, value) => {
        //Only allow single digit
        if(!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1) //take last character only;
        setOtp(newOtp);

        // Auto jump to next box typing
        if(value && index<5){
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // On backspace - clear current box and jump back
        if(e.key === 'Backspace' && !otp[index] && index > 0){
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        //Handle paste - fill all 6 boxes at once
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').slice(0,6);
        if(!/^\d+$/.test(pasted)) return;

        const newOtp = [...otp];
        pasted.split('').forEach((digit, index) => {
            newOtp[index] = digit;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(pasted.length,5)]?.focus();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if(otpString.length < 6){
            setError('Please enter all 6 digits.');
            return;
        }

        setError('');
        setLoading(true);

        try{
            const data = await verifyOtp(email, otpString);

            //OTP correct - save JWT token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name);

            //Navigate to the welcome page
            navigate('/welcome', {state: {name: data.name}});
        }
        catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP, Please try again.');

            //Clear OTP boxes on wrong attempt
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
        finally {
            setLoading(false);
        }
    };

    return(
        <div style={styles.container}>
            <div style={styles.card}>
                {/* HEADER */}
                <h2 style={styles.title}>Check your mail</h2>
                <p style={styles.subtitles}>
                    We sent a 6-digit OTP to <br />
                    <strong>{email}</strong>
                </p>

                {/* OTP Form */}

                <form onSubmit={handleSubmit}>
                    <div style={styles.otpRow} onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                               key={index}
                               ref={(el) => (inputRefs.current[index] = el)}
                               type="text"
                               inputMode="numeric"
                               maxLength={1}
                               value={digit}
                               onChange={(e) => handleChange(index, e.target.value)}
                               onKeyDown={(e) => handleKeyDown(index, e)}
                               style={{
                                   ...styles.otpBox,
                                   borderColor: digit? '#4f46e5' : '#ddd',
                                   backgroundColor: digit ? "#f0f0ff" : "#fff",
                               }}
                            />
                        ))}
                    </div>

                    {/* Error */}
                    {error && <p style={styles.error}>{error}</p> }

                    {/* Verify button */}
                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading || otp.join('').length<6}
                        >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>

                {/* Go back */}
                <p style={styles.backText}>
                    Wrong email?{' '}
                    <span style={styles.backLink} onClick={() => navigate('/')}>
                        Go back
                    </span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4ff',
        fontFamily: 'Segoe UI, sans-serif',
    },
    card: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
    },
    iconBox: {
        fontSize: '48px',
        marginBottom: '12px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1a1a2e',
        margin: '0 0 8px 0',
    },
    subtitle: {
        color: '#666',
        marginBottom: '28px',
        fontSize: '15px',
        lineHeight: '1.6',
    },
    otpRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px',
    },
    otpBox: {
        width: '48px',
        height: '56px',
        fontSize: '24px',
        fontWeight: '700',
        textAlign: 'center',
        border: '2px solid #ddd',
        borderRadius: '10px',
        outline: 'none',
        transition: 'border-color 0.2s, background-color 0.2s',
        color: '#1a1a2e',
    },
    error: {
        color: '#e53e3e',
        fontSize: '14px',
        marginBottom: '12px',
    },
    button: {
        width: '100%',
        padding: '13px',
        backgroundColor: '#4f46e5',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    backText: {
        marginTop: '20px',
        color: '#666',
        fontSize: '14px',
    },
    backLink: {
        color: '#4f46e5',
        fontWeight: '600',
        cursor: 'pointer',
    },
};

export default OtpPage;