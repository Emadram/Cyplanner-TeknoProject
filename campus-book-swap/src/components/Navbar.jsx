import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated = false }) => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-gray-50 border-b border-gray-200">
      <div className="text-xl font-bold">
        <Link to="/">YourApp</Link>
      </div>
      <div className="flex gap-4">
        <Link to="/" className="text-gray-800 hover:text-gray-600">Home</Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-gray-800 hover:text-gray-600">Dashboard</Link>
            <Link to="/profile" className="text-gray-800 hover:text-gray-600">Profile</Link>
            <button className="text-gray-800 hover:text-gray-600">Logout</button>
          </>
        ) : (
          <>
            <Link to="/signin" className="text-gray-800 hover:text-gray-600">Sign In</Link>
            <Link to="/signup" className="text-gray-800 hover:text-gray-600">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
