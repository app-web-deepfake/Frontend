import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  const registerUser = (userData) => {
    // En una aplicación real, aquí harías una llamada a la API
    // Por ahora, solo almacenamos en el estado local
    setUsers(prevUsers => [...prevUsers, { ...userData, id: Date.now() }]);
    return true;
  };

  const value = {
    users,
    registerUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};