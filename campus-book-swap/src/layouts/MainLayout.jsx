import { Outlet, useOutletContext } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  // For now, hardcoded authentication state
  // Later, this would come from a context or prop
  const isAuthenticated = false;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
        <Outlet context={{ isAuthenticated }} />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
