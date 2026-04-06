import { useState, useEffect } from "react";

export default function AdminDashboard({ user, api, onLogout, onSwitch }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPending = async () => {
    setLoading(true);
    const data = await api("/admin/resources/pending");
    setPending(data.resources || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPending();
  }, []);

  const approve = async (resourceId) => {
    await api(`/admin/resources/${resourceId}/approve`, { method: "PATCH" });
    loadPending();
  };

  const reject = async (resourceId) => {
    await api(`/admin/resources/${resourceId}/reject`, { method: "PATCH" });
    loadPending();
  };

  return (
    <div className="page">
      <nav className="topnav">
        <div className="topnav-logo">Edu<span>Bazzar</span></div>
        <div className="topnav-role-badge">Admin</div>
        <div className="topnav-spacer" />
        <button className="btn btn-ghost btn-sm" onClick={onSwitch}>Switch</button>
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
      </nav>

      <div className="container section">
        <div className="page-title">Pending Resources ({pending.length})</div>
        {loading ? (
          <div style={{textAlign:"center", padding:"60px 0"}}>
            <span className="spinner spinner-dark" style={{width:32,height:32}} />
          </div>
        ) : pending.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <div className="empty-title">All caught up!</div>
            <p>No pending resources to review</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Title</th><th>Seller</th><th>Branch</th><th>Category</th><th>Price</th><th>Action</th>
              </tr></thead>
              <tbody>
                {pending.map(r => (
                  <tr key={r._id}>
                    <td><strong>{r.title}</strong></td>
                    <td>{r.sellerId?.name}</td>
                    <td>{r.branch}</td>
                    <td>{r.category}</td>
                    <td>₹{r.price}</td>
                    <td style={{display:"flex", gap:8}}>
                      <button className="btn btn-success btn-sm" onClick={() => approve(r._id)}>✓ Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => reject(r._id)}>✗ Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
