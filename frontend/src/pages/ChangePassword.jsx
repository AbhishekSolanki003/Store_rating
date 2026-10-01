import { useState } from 'react';
import api from '../services/api';
import FormMessage from '../components/FormMessage';

export default function ChangePassword() {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '' }); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function submit(event) { event.preventDefault(); setMessage(''); setError(''); try { const { data } = await api.put('/users/password', values); setMessage(data.message); setValues({ currentPassword: '', newPassword: '' }); } catch (err) { setError(err.response?.data?.message || 'Unable to update password'); } }
  return <section className="narrow-page"><p className="eyebrow">ACCOUNT SECURITY</p><h1>Change password</h1><div className="panel"><form onSubmit={submit}><label>Current password<input required type="password" value={values.currentPassword} onChange={e => setValues({ ...values, currentPassword: e.target.value })} /></label><label>New password <small>8-16 chars, uppercase and special character</small><input required type="password" minLength="8" maxLength="16" value={values.newPassword} onChange={e => setValues({ ...values, newPassword: e.target.value })} /></label><FormMessage message={error} /><p className="success-message">{message}</p><button className="primary-button">Update password</button></form></div></section>;
}
