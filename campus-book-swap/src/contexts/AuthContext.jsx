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
          console.log("Verifying token with Strapi...");
          // Verify token with Strapi
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/users/me`, 
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          console.log("Token verified successfully, user data:", response.data);
          
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
      } else {
        console.log("No token found in localStorage");
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (userData) => {
    console.log("Login called with user data:", userData);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    console.log("Logout called");
    // Clear token from storage
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Create a separate instance of axios that will always include the current token
  const authAxios = axios.create();
  
  // Add auth token to all requests
  authAxios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        // Make sure headers object exists
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Added token to request:", config.url);
      } else {
        console.log("No token available for request:", config.url);
      }
      return config;
    },
    (error) => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
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