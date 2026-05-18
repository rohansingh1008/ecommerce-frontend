import React, { useState, useEffect } from 'react';
import axios from 'axios';

// When running locally, point to localhost. When deploying to production, replace with your Render link!
const API_BASE = "https://ecommerce-admin-api-xxxx.onrender.com/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState({ total_revenue: 0, total_sales: 0 });
  
  // New Product Input Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      if (res.data.user.role !== 'superadmin') {
        alert("Access Denied. Admin clearance required.");
        return;
      }
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert("Invalid login attempt.");
    }
  };

  const loadDashboardData = async () => {
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const prodRes = await axios.get(`${API_BASE}/products`);
      const orderRes = await axios.get(`${API_BASE}/orders`, config);
      setProducts(prodRes.data);
      setMetrics(orderRes.data.metrics || { total_revenue: 0, total_sales: 0 });
    } catch (err) {
      console.error("Error retrieving synchronized dashboard records", err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.post(`${API_BASE}/products`, {
        title,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock),
        image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30" // Placeholder clean display image
      }, config);
      
      // Clear forms
      setTitle(''); setDescription(''); setPrice(''); setStock('');
      alert("Inventory Asset Added!");
      loadDashboardData(); // Refresh list automatically
    } catch (err) {
      alert("Could not process product injection.");
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // View 1: If User is Not Logged In, Show Gatekeeper Interface
  if (!token) {
    return (
      <div style={{ maxWidth: '380px', margin: '120px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '12px', fontFamily: 'sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h3 style={{ textAlign: 'center', color: '#333' }}>Secure Control Gate</h3>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Admin Identity Email:</label>
            <input type="email" style={{ width: '100%', padding: '10px', marginTop: '6px', boxSizing: 'border-box' }} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Security Code Phrase:</label>
            <input type="password" style={{ width: '100%', padding: '10px', marginTop: '6px', boxSizing: 'border-box' }} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Verify Profile</button>
        </form>
      </div>
    );
  }

  // View 2: Authorized Management Workspace Display View
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
        <h2>System Core Inventory Workspace</h2>
        <button onClick={() => { localStorage.clear(); setToken(''); }} style={{ padding: '10px 16px', backgroundColor: '#DC3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Revoke Token Access</button>
      </header>

      {/* METRICS RENDER GRID CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '4px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '6px solid #007BFF' }}>
          <p style={{ margin: '0 0 8px 0', color: '#777', textTransform: 'uppercase', fontSize: '12px' }}>Total Sales Capitalizado</p>
          <h3>₹{Number(metrics?.total_revenue || 0).toLocaleString()}</h3>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '6px solid #28A745' }}>
          <p style={{ margin: '0 0 8px 0', color: '#777', textTransform: 'uppercase', fontSize: '12px' }}>Orders Logged</p>
          <h3>{metrics?.total_sales || 0} Invoices</h3>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '6px solid #DC3545' }}>
          <p style={{ margin: '0 0 8px 0', color: '#777', textTransform: 'uppercase', fontSize: '12px' }}>Out Of Stock Trackers</p>
          <h3>{products.filter(p => p.stock_quantity === 0).length} Disrupted</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', marginTop: '40px' }}>
        {/* INTAKE CREATION PANEL */}
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: 'fit-content' }}>
          <h4 style={{ marginTop: 0 }}>Catalog New Inventory Entry</h4>
          <form onSubmit={handleAddProduct}>
            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '13px' }}>Item Title:</label><input type="text" style={{ width: '100%', padding: '8px', marginTop: '4px' }} value={title} onChange={e => setTitle(e.target.value)} required /></div>
            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '13px' }}>Context Description:</label><textarea style={{ width: '100%', padding: '8px', marginTop: '4px' }} value={description} onChange={e => setDescription(e.target.value)} required /></div>
            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '13px' }}>Price Target (INR):</label><input type="number" style={{ width: '100%', padding: '8px', marginTop: '4px' }} value={price} onChange={e => setPrice(e.target.value)} required /></div>
            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '13px' }}>Unit Counts:</label><input type="number" style={{ width: '100%', padding: '8px', marginTop: '4px' }} value={stock} onChange={e => setStock(e.target.value)} required /></div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#28A745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Commit Entry</button>
          </form>
        </div>

        {/* LOGISTICS INDEX TABULAR FRAME */}
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h4 style={{ marginTop: 0 }}>Active Warehouse Directory Index</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#f1f3f5', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Product</th>
                <th style={{ padding: '12px' }}>Price</th>
                <th style={{ padding: '12px' }}>Stock Counter</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}><strong>{p.title}</strong></td>
                  <td style={{ padding: '12px' }}>Lorem ₹{p.price}</td>
                  <td style={{ padding: '12px' }}>
                    {p.stock_quantity === 0 ? (
                      <span style={{ color: '#DC3545', fontWeight: 'bold' }}>Depleted</span>
                    ) : (
                      `${p.stock_quantity} units`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}