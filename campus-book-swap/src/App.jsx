import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Fetch data from Strapi API using authenticated requests when needed
const fetchStrapiData = async (endpoint) => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/${endpoint}`, 
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching data from Strapi:', error);
    return null;
  }
};

// Enhanced Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
};

// Home route handler - redirect to dashboard if authenticated
const HomeRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />;
};

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchStrapiData('books').then(setData);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes with Home Redirection */}
            <Route index element={<HomeRoute />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="signin" element={<SignIn />} />
            
            {/* Protected Routes */}
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;