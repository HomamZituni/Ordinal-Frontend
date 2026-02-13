import { createContext, useState, useEffect } from 'react';
//global container for Auth
export const AuthContext = createContext();
// the state with required pieces for auth to work
export function AuthProvider({children}) {
const [user, setUser] = useState(null);
const [token, setToken] = useState(null);
const [loading, setLoading] = useState(true);

// Load token from localStorage on mount if available to avoid req login on refresh
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && storedUser !== 'undefined') {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

//login function
const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

//logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }; 

  // any component using useAuth() will get access to these 5 objects
  const value = {
    user,
    token,
    login,
    logout,
    loading
  };
// gives children access to the value object 
    return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}



