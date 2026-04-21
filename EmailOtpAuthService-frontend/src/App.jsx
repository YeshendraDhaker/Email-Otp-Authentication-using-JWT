import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import RegisterPage from "./pages/RegisterPage.jsx";
import OtpPage from "./pages/OtpPage.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";

function App(){
    return(
        <BrowserRouter>
            <Routes>
                {/*Default route -> Register Page*/}
                <Route path="/" element={<RegisterPage />} />

                {/*OTP verification page*/}
                <Route path="/verify-otp" element={<OtpPage />} />

                {/*Welcome page after successful login*/}
                <Route path="/welcome" element={<WelcomePage />} />

                {/*Any unknown route -> back to register */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;