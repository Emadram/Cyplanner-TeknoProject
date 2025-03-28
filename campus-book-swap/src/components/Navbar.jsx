import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">YourApp</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">Home</Link>
        <Link to="/signin" className="navbar-item">Sign In</Link>
        <Link to="/signup" className="navbar-item">Sign Up</Link>
      </div>
    </nav>
  );
};

export default Navbar;
