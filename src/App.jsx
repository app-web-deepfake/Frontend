import Register from './pages/Register'
import { UserProvider } from './context/UserContext'
import './App.css'

function App() {
  return (
    <UserProvider>
      <Register />
    </UserProvider>
  )
}

export default App
