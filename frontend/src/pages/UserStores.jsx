import { useEffect, useState } from 'react';
import api from '../services/api';
import FormMessage from '../components/FormMessage';

export default function UserStores() {
  const [stores, setStores] = useState([]); const [search, setSearch] = useState(''); const [order, setOrder] = useState('asc'); const [message, setMessage] = useState('');
  async function load() { try { const { data } = await api.get('/stores', { params: { search, order } }); setStores(data.stores); } catch (error) { setMessage(error.response?.data?.message || 'Unable to load stores'); } }
  useEffect(() => { load(); }, [order]);
  async function rate(storeId, rating) { try { await api.put(`/stores/${storeId}/ratings`, { rating: Number(rating) }); await load(); } catch (error) { setMessage(error.response?.data?.message || 'Unable to save rating'); } }
  return <section><div className="page-heading"><div><p className="eyebrow">NORMAL USER</p><h1>Find a store</h1><p className="muted">Search registered stores and keep your ratings up to date.</p></div><div className="toolbar"><input placeholder="Search name or address" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} /><button className="secondary-button" onClick={load}>Search</button><select value={order} onChange={e => setOrder(e.target.value)}><option value="asc">Name A-Z</option><option value="desc">Name Z-A</option></select></div></div><FormMessage message={message} /><div className="store-grid">{stores.map(store => <article className="store-card" key={store.id}><div><p className="card-kicker">STORE</p><h2>{store.name}</h2><p className="muted">{store.address}</p><p className="store-email">{store.email}</p></div><div className="rating-line"><strong>{store.overallRating || '0.00'}</strong><span>overall rating</span></div><label>Your rating<select value={store.myRating || ''} onChange={e => e.target.value && rate(store.id, e.target.value)}><option value="">Not rated</option>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} / 5</option>)}</select></label></article>)}</div>{!stores.length && <div className="empty-state">No stores match that search.</div>}</section>;
}
