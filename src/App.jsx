import Register from './pages/Register'
import './App.css'
import Home from "./pages/Home.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { Route, Routes } from "react-router-dom";
import ResultPage from "./pages/ResultPage.jsx";
import UploadPage from "./components/Upload.jsx";
import Historial from "./pages/Historial.jsx";
import Recomendaciones from "./pages/Recomendaciones.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/result/:referenceId" element={<ResultPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/recomendaciones" element={<Recomendaciones />} />
        </Routes>
    )
}

//

export default App;