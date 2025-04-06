import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      {/* Top Bar with Secondary Links */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-1">
          <div className="flex justify-between items-center text-xs">
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-300">About Us</a>
              <a href="#" className="hover:text-blue-300">Contact</a>
              <a href="#" className="hover:text-blue-300">Help</a>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="flex items-center hover:text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (555) 123-4567
              </a>
              <a href="#" className="flex items-center hover:text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@campusbookshop.com
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <div>
              <span className="font-serif text-xl font-bold text-gray-800">Campus</span>
              <span className="font-serif text-xl font-bold text-blue-600">BookShop</span>
            </div>
          </Link>
          
          {/* Main Search Bar - Now the only search bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, author, ISBN..."
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
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/books" className="text-gray-600 hover:text-blue-600 transition-colors">
              Books
            </Link>
            <Link to="/textbooks" className="text-gray-600 hover:text-blue-600 transition-colors">
              Textbooks
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-blue-600 transition-colors">
              Categories
            </Link>
            
            {/* Cart Icon */}
            <Link to="/cart" className="text-gray-600 hover:text-blue-600 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
            
            {/* User Account */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  <span className="mr-1 hidden lg:block">{user?.username || 'User'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <Link 
                      to="/dashboard" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      My Orders
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/signin" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {showMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="px-4 py-2">
            <input
              type="text"
              placeholder="Search by title, author, ISBN..."
              className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 border-none"
            />
            <div className="absolute left-7 mt-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/books" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Books
            </Link>
            <Link to="/textbooks" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Textbooks
            </Link>
            <Link to="/categories" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Categories
            </Link>
            <Link to="/cart" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Cart
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  Dashboard
                </Link>
                <Link to="/profile" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  Sign In
                </Link>
                <Link to="/signup" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Category Navigation */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto py-3 text-sm font-medium text-gray-700 no-scrollbar">
            <Link to="/category/fiction" className="whitespace-nowrap hover:text-blue-600 transition-colors">Fiction</Link>
            <Link to="/category/non-fiction" className="whitespace-nowrap hover:text-blue-600 transition-colors">Non-Fiction</Link>
            <Link to="/category/textbooks" className="whitespace-nowrap hover:text-blue-600 transition-colors">Textbooks</Link>
            <Link to="/category/science" className="whitespace-nowrap hover:text-blue-600 transition-colors">Science</Link>
            <Link to="/category/history" className="whitespace-nowrap hover:text-blue-600 transition-colors">History</Link>
            <Link to="/category/computer-science" className="whitespace-nowrap hover:text-blue-600 transition-colors">Computer Science</Link>
            <Link to="/category/mathematics" className="whitespace-nowrap hover:text-blue-600 transition-colors">Mathematics</Link>
            <Link to="/category/business" className="whitespace-nowrap hover:text-blue-600 transition-colors">Business</Link>
            <Link to="/category/used-books" className="whitespace-nowrap hover:text-blue-600 transition-colors">Used Books</Link>
            <Link to="/category/rare-books" className="whitespace-nowrap hover:text-blue-600 transition-colors">Rare Books</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;