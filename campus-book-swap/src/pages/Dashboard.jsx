import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, don't render the dashboard
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {user && (
        <p className="text-gray-600 mb-4">Welcome, {user.email}!</p>
      )}
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-700 mb-4">Welcome to your dashboard!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-lg font-medium mb-2">Recent Activity</h2>
            <p className="text-gray-600">No recent activity to display.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-lg font-medium mb-2">Statistics</h2>
            <p className="text-gray-600">No statistics available yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;