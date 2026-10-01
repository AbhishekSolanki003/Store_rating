import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormMessage from '../components/FormMessage';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault(); setMessage('');
    try { await login(values); navigate('/'); } catch (error) { setMessage(error.response?.data?.message || 'Unable to log in'); }
  }
  return <section className="auth-card"><p className="eyebrow">STORE RATING PLATFORM</p><h1>Welcome back.</h1><p className="muted">Sign in to rate stores, manage listings, or review feedback.</p><form onSubmit={submit}><label>Email<input type="email" required value={values.email} onChange={e => setValues({ ...values, email: e.target.value })} /></label><label>Password<input type="password" required value={values.password} onChange={e => setValues({ ...values, password: e.target.value })} /></label><FormMessage message={message} /><button className="primary-button">Log in</button></form><p className="auth-link">New here? <Link to="/register">Create a normal user account</Link></p></section>;
}
