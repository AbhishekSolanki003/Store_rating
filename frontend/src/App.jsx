import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserStores from './pages/UserStores';
import OwnerDashboard from './pages/OwnerDashboard';
import ChangePassword from './pages/ChangePassword';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'STORE_OWNER' ? '/owner/dashboard' : '/user/stores'} replace />;
}

export default function App() {
  return <Layout><Routes><Route path="/" element={<HomeRedirect />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} /><Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} /><Route path="/admin/stores" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} /><Route path="/user/stores" element={<ProtectedRoute roles={['NORMAL_USER']}><UserStores /></ProtectedRoute>} /><Route path="/user/change-password" element={<ProtectedRoute roles={['NORMAL_USER']}><ChangePassword /></ProtectedRoute>} /><Route path="/owner/dashboard" element={<ProtectedRoute roles={['STORE_OWNER']}><OwnerDashboard /></ProtectedRoute>} /><Route path="/owner/change-password" element={<ProtectedRoute roles={['STORE_OWNER']}><ChangePassword /></ProtectedRoute>} /><Route path="*" element={<HomeRedirect />} /></Routes></Layout>;
}
