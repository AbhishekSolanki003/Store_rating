import { useEffect, useState } from 'react';
import api from '../services/api';

export default function OwnerDashboard() {
  const [stores, setStores] = useState([]); const [message, setMessage] = useState('');
  useEffect(() => { api.get('/owner/dashboard').then(({ data }) => setStores(data.stores)).catch(error => setMessage(error.response?.data?.message || 'Unable to load dashboard')); }, []);
  return <section><p className="eyebrow">STORE OWNER</p><h1>Feedback for your stores</h1><p className="muted">See who rated your stores and how they are performing.</p>{message && <p className="form-message">{message}</p>}{stores.map(store => <div className="panel owner-panel" key={store.id}><div className="panel-heading"><div><p className="card-kicker">STORE</p><h2>{store.name}</h2></div><div className="big-rating">{store.averageRating}<small>average rating</small></div></div><div className="table-wrap"><table><thead><tr><th>User</th><th>Email</th><th>Rating</th><th>Date</th></tr></thead><tbody>{store.ratings.map((rating, index) => <tr key={index}><td>{rating.userName}</td><td>{rating.email}</td><td><strong>{rating.rating} / 5</strong></td><td>{new Date(rating.date).toLocaleDateString()}</td></tr>)}</tbody></table></div>{!store.ratings.length && <p className="muted">No ratings yet.</p>}</div>)}</section>;
}
