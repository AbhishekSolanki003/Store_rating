import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const home = user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'STORE_OWNER' ? '/owner/dashboard' : '/user/stores';
  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to={home}>Store<span>Rate</span></Link>
      {user && <nav><Link to={home}>Dashboard</Link>{user.role === 'NORMAL_USER' && <Link to="/user/change-password">Password</Link>}{user.role === 'STORE_OWNER' && <Link to="/owner/change-password">Password</Link>}<span className="user-label">{user.name} · {user.role.replace('_', ' ')}</span><button className="link-button" onClick={() => { logout(); navigate('/login'); }}>Log out</button></nav>}
    </header>
    <main className="page-content">{children}</main>
  </div>;
}
