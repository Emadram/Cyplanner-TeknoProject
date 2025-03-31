import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ isAuthenticated }) => {
  const { logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and App Name */}
          <div className="flex items-center">
            <Link to="/" className="font-serif text-xl font-bold text-gray-800">
              BookSwap
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search books..."
                className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="hidden md:inline">Dashboard</span>
                  </div>
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-gray-800">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden md:inline">Profile</span>
                  </div>
                </Link>
                <button 
                  onClick={logout} 
                  className="text-gray-600 hover:text-gray-800"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden md:inline">Logout</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="text-gray-600 hover:text-gray-800">Sign In</Link>
                <Link to="/signup" className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-200">Sign Up</Link>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Search - Only visible on mobile */}
        <div className="mt-2 md:hidden">
          <input
            type="text"
            placeholder="Search books..."
            className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="absolute left-7 top-14 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
