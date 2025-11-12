import Register from './pages/Register'
import { UserProvider } from './context/UserContext'
import './App.css'
import Home from "./pages/Home.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import {Route, Routes} from "react-router-dom";

function App() {
  return (
    <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
    </Routes>
  )
}

export default App;

