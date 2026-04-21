import {useState} from "react";
import {useNavigate} from 'react-router-dom';
import {registerUser, sendLoginOtp} from "../api/authApi.js";

function RegisterPage() {

    const navigate = useNavigate();

    //Toggle between Register and Login mode
    const[isLogin, setIsLogin] = useState(false);

    //Input Fields
    const[name, setName] = useState('');
    const[email, setEmail] = useState('');

    //UI State
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try{
            if(isLogin){
                //Login flow - just send OTP
                await sendLoginOtp(email);
            }
            else{
               //Register flow = send name + email
               await registerUser(name, email);
            }

            //OTP sent = navigate to OTP Page
            //Pass email via location state so OtpPage know who to verify
            navigate('/verify-otp', {state: {email}});
        }
        catch (err){
            //show error from backend
            setError(err.response?.data?.message || 'Something went wrong. Try again later.');
        }
        finally {
            setLoading(false);
        }
    };

    return(
        <div style={styles.container}>
            <div style={styles.card}>

                {/* Header */}
                <h1 style={styles.title}>OTP Authentication</h1>
                <p style={styles.subtitle}>
                    {isLogin ? 'Login to your account' : 'Create a new account'}
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>

                    {/* Name field - only for register */}
                    {!isLogin && (
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={!isLogin}
                                style={styles.input}
                                />
                        </div>
                    )}
                    {/* Email field - only for register */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="text"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    {/* Error message */}
                    {error && <p style={styles.error}>{error}</p>}

                    {/* Submit Button */}
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Sending OTP...' : isLogin ? 'Send OTP' : 'Register'}
                    </button>
                </form>
                {/* Toggle Register / Login */}
                <p style={styles.toggleText}>
                    {isLogin ? "Don't have an account?" : 'Already registered?'}
                    <span
                        style={styles.toggleLink}
                        onClick={() => {setIsLogin(!isLogin); setError('');}}
                        >
                        {isLogin ? 'Register' : 'Login'}
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
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a1a2e',
        margin: '0 0 8px 0',
        textAlign: 'center',
    },
    subtitle: {
        color: '#666',
        textAlign: 'center',
        marginBottom: '28px',
        fontSize: '15px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
    },
    input: {
        padding: '12px 14px',
        borderRadius: '8px',
        border: '1.5px solid #ddd',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    error: {
        color: '#e53e3e',
        fontSize: '14px',
        margin: '0',
        textAlign: 'center',
    },
    button: {
        padding: '13px',
        backgroundColor: '#4f46e5',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '4px',
    },
    toggleText: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#666',
        fontSize: '14px',
    },
    toggleLink: {
        color: '#4f46e5',
        fontWeight: '600',
        cursor: 'pointer',
    },
}

export default RegisterPage;