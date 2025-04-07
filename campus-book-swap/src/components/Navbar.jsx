import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import MiniCart from './MiniCart';

const NavBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const cartRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns when navigating to a new page
  useEffect(() => {
    setIsCartOpen(false);
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  // Toggle cart dropdown
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  // Toggle profile dropdown
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isCartOpen) setIsCartOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="ml-2 text-lg font-bold text-gray-800">CampusBookSwap</span>
              </div>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link 
                to="/books" 
                className={`px-3 py-2 text-sm font-medium ${
                  location.pathname === '/books' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                All Books
              </Link>
              <Link 
                to="/textbooks" 
                className={`px-3 py-2 text-sm font-medium ${
                  location.pathname === '/textbooks' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Textbooks
              </Link>
              <Link 
                to="/about" 
                className={`px-3 py-2 text-sm font-medium ${
                  location.pathname === '/about' 
                    ? 'text-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                About
              </Link>
            </div>
          </div>
          
          {/* Search bar - can be toggled in responsive design */}
          <div className="hidden md:flex flex-1 justify-center max-w-xs mx-4">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search books, courses..." 
                className="w-full px-4 py-1 pl-10 pr-4 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <div className="absolute left-3 top-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* User Navigation */}
          <div className="flex items-center">
            {/* Cart Icon with Counter */}
            {isAuthenticated && (
              <div className="relative ml-4" ref={cartRef}>
                <button 
                  onClick={toggleCart}
                  className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none relative"
                  aria-label="Shopping cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
                
                {/* Cart Dropdown */}
                {isCartOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                    <MiniCart onClose={() => setIsCartOpen(false)} />
                  </div>
                )}
              </div>
            )}
            
            {/* Messages Icon with Counter - Only for authenticated users */}
            {isAuthenticated && (
              <Link to="/messages" className="relative ml-4 p-2 text-gray-600 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                
                {/* Show badge if there are unread messages - replace 0 with actual count */}
                {(0 > 0) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {0 > 99 ? '99+' : 0}
                  </span>
                )}
              </Link>
            )}
            
            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="relative ml-4" ref={profileRef}>
                <button 
                  onClick={toggleProfile}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
                  aria-label="User profile"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-700">{user.username || user.email}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileOpen(false)}>
                        Dashboard
                      </Link>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileOpen(false)}>
                        Profile
                      </Link>
                      <Link to="/cart" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileOpen(false)}>
                        My Cart
                      </Link>
                      <Link to="/messages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileOpen(false)}>
                        Messages
                      </Link>
                      <div className="border-t border-gray-200 mt-1 pt-1">
                        <button 
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <Link to="/signin" className="ml-4 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                  Sign In
                </Link>
                <Link to="/signup" className="ml-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex md:hidden ml-4">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none"
                aria-expanded={isMenuOpen}
                aria-label="Main menu"
              >
                {isMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          {/* Mobile search */}
          <div className="px-4 py-2 border-t border-gray-200">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search books, courses..." 
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Mobile navigation links */}
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
            <Link 
              to="/books" 
              className={`block px-3 py-2 text-base font-medium rounded-md ${
                location.pathname === '/books' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Books
            </Link>
            <Link 
              to="/textbooks" 
              className={`block px-3 py-2 text-base font-medium rounded-md ${
                location.pathname === '/textbooks' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Textbooks
            </Link>
            <Link 
              to="/about" 
              className={`block px-3 py-2 text-base font-medium rounded-md ${
                location.pathname === '/about' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              About
            </Link>
            
            {/* Authenticated user mobile links */}
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    location.pathname === '/dashboard' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    location.pathname === '/profile' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Profile
                </Link>
                <Link 
                  to="/cart" 
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    location.pathname === '/cart' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
                <Link 
                  to="/messages" 
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    location.pathname === '/messages' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Messages
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-100 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/signin" 
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    location.pathname === '/signin' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="block px-3 py-2 text-base font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;