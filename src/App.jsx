import Register from './pages/Register'
import { UserProvider } from './context/UserContext'
import './App.css'
import Home from "./pages/Home.jsx";
import LoginPage from "./pages/LoginPage.jsx";

function App() {
  return (
    <UserProvider>
      <Home />
    </UserProvider>
  )
}

export default App;

