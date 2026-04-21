import {useLocation, useNavigate} from "react-router-dom";
import {useEffect} from "react";

function WelcomePage() {

    const navigate = useNavigate();
    const location = useLocation();

    //Get name from navigation State OR from localStorage
    const name = location.state?.name || localStorage.getItem('userName') || 'User';


    //If no token found, redirect to login
    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token) navigate('/');
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/');
    };

    return(
        <div style={styles.container}>
            <div style={styles.card}>

                <div style={styles.successIcon}></div>

                {/* Welcome Page */}
                <h1 style={styles.title}>Welcome, {name}!</h1>
                <p style={styles.subtitle}>
                    You have successfully logged in using Email OTP Authentication.
                </p>

                {/* Token info box */}
                <div style={styles.infoBox}>
                    <p style={styles.infoText}> JWT Token saved</p>
                    <p style={styles.infoSubject}>
                        Your session is active. Token stored in localStorage.
                    </p>
                </div>

                {/* Logout button */}
                <button style={styles.logoutButton} onClick={handleLogout}>
                    Logout
                </button>
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
        padding: '48px 40px',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
    },
    successIcon: {
        fontSize: '56px',
        marginBottom: '16px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a1a2e',
        margin: '0 0 10px 0',
    },
    subtitle: {
        color: '#666',
        fontSize: '15px',
        marginBottom: '28px',
        lineHeight: '1.6',
    },
    infoBox: {
        backgroundColor: '#f0fdf4',
        border: '1.5px solid #86efac',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '28px',
    },
    infoText: {
        margin: '0 0 4px 0',
        fontWeight: '600',
        color: '#166534',
        fontSize: '15px',
    },
    infoSubText: {
        margin: '0',
        color: '#4ade80',
        fontSize: '13px',
    },
    logoutButton: {
        width: '100%',
        padding: '13px',
        backgroundColor: '#fff',
        color: '#e53e3e',
        border: '2px solid #e53e3e',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
    },
};

export default WelcomePage;