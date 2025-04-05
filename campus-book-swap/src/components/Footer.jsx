import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-4">BookSwap</h3>
            <p className="text-gray-600 text-sm">
              Your platform to exchange, sell, and borrow books from students across campus.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Explore</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 text-sm hover:text-gray-800">Home</Link></li>
              <li><Link to="/" className="text-gray-600 text-sm hover:text-gray-800">Browse Books</Link></li>
              <li><Link to="/" className="text-gray-600 text-sm hover:text-gray-800">Categories</Link></li>
              <li><Link to="/" className="text-gray-600 text-sm hover:text-gray-800">Recently Added</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/signin" className="text-gray-600 text-sm hover:text-gray-800">Sign In</Link></li>
              <li><Link to="/signup" className="text-gray-600 text-sm hover:text-gray-800">Sign Up</Link></li>
              <li><Link to="/profile" className="text-gray-600 text-sm hover:text-gray-800">My Profile</Link></li>
              <li><Link to="/" className="text-gray-600 text-sm hover:text-gray-800">My Books</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">About</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 text-sm hover:text-gray-800">How It Works</Link></li>
              <li><Link to="/" className="text-gray-600 text-sm hover:text-gray-800">Contact Us</Link></li>
              <li><Link to="/" className="text-gray-600 text-sm hover:text-gray-800">Privacy Policy</Link></li>
              <li><Link to="/" className="text-gray-600 text-sm hover:text-gray-800">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} CampusBookSwap. All rights reserved.
          </p>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-gray-800">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-800">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-800">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
