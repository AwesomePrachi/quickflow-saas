import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import RegisterOrg from './pages/RegisterOrg';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import WelcomeModal from './components/WelcomeModal';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const { user } = useAuth();

  return (
    <>
      <ScrollToTop />
      <WelcomeModal />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register-org" element={!user ? <RegisterOrg /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/users" element={<Users />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
