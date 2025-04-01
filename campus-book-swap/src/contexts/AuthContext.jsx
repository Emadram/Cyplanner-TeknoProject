import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (token exists)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify token with Strapi
          const response = await axios.get(
            `${import.meta.env.VITE_STRAPI_API_URL}/api/users/me`, 
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          setUser({
            email: response.data.email,
            username: response.data.username,
            id: response.data.id,
            token
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token validation error:', error);
          // Token is invalid or expired
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    // Clear token from storage
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Create an axios instance with the auth token
  const authAxios = axios.create();
  
  // Add auth token to all requests
  authAxios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout,
      authAxios,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);