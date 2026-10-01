import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormMessage from '../components/FormMessage';

const initial = { name: '', email: '', password: '', address: '' };
export default function Register() {
  const { register } = useAuth(); const navigate = useNavigate(); const [values, setValues] = useState(initial); const [message, setMessage] = useState(''); const [details, setDetails] = useState(null);
  async function submit(event) { event.preventDefault(); setMessage(''); setDetails(null); try { await register(values); navigate('/'); } catch (error) { setMessage(error.response?.data?.message || 'Unable to register'); setDetails(error.response?.data?.errors); } }
  return <section className="auth-card"><p className="eyebrow">CREATE ACCOUNT</p><h1>Join StoreRate.</h1><p className="muted">Registration creates a normal user account. Staff accounts are managed by an admin.</p><form onSubmit={submit}><label>Full name <small>20-60 characters</small><input required minLength="20" maxLength="60" value={values.name} onChange={e => setValues({ ...values, name: e.target.value })} /></label><label>Email<input required type="email" value={values.email} onChange={e => setValues({ ...values, email: e.target.value })} /></label><label>Address <small>up to 400 characters</small><textarea required maxLength="400" value={values.address} onChange={e => setValues({ ...values, address: e.target.value })} /></label><label>Password <small>8-16 chars, uppercase and special character</small><input required type="password" minLength="8" maxLength="16" value={values.password} onChange={e => setValues({ ...values, password: e.target.value })} /></label><FormMessage message={message} details={details} /><button className="primary-button">Create account</button></form><p className="auth-link">Already registered? <Link to="/login">Log in</Link></p></section>;
}
