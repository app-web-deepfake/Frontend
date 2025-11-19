import Register from './pages/Register'
import './App.css'
import Home from "./pages/Home.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import {Route, Routes} from "react-router-dom";
import Result from "./pages/ResultPage.jsx";
import UploadPage from "./components/Upload.jsx";
import ResultPage from "./pages/ResultPage.jsx";

function App() {
  return (
    <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/result/:referenceId" element={<ResultPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
    </Routes>
  )
}

export default App;

