import './App.css';
import { Route, Routes } from "react-router-dom";
import PrivateRoute from './components/PrivateRoute.jsx';
import LoginPage from "./pages/LoginPage.jsx";
import Register from './pages/Register';
import Home from "./pages/Home.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import Historial from "./pages/Historial.jsx";
import Recomendaciones from "./pages/Recomendaciones.jsx";
import NotFound from "./pages/NotFound.jsx";
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

import Profile from './pages/Profile.jsx';

function App() {
    return (
        <Routes>
            {/* Rutas publicas */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Rutas privadas — redirigen al login si no hay sesion */}
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/result/:referenceId" element={<PrivateRoute><ResultPage /></PrivateRoute>} />
            <Route path="/result" element={<PrivateRoute><ResultPage /></PrivateRoute>} />
            <Route path="/historial" element={<PrivateRoute><Historial /></PrivateRoute>} />
            <Route path="/recomendaciones" element={<PrivateRoute><Recomendaciones /></PrivateRoute>} />
            <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;