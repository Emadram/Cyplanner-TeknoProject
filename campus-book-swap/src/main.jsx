import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout with shared header/footer */}
        <Route path="/" element={<MainLayout />}>
          {/* Home page */}
          <Route index element={<Home />} />
          
          {/* Auth routes */}
          <Route path="signup" element={<SignUp />} />
          <Route path="signin" element={<SignIn />} />
          
          {/* 404 - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
