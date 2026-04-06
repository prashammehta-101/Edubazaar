import { useState, useEffect } from "react";

const BRANCHES = ["CS","IT","Mechanical","Civil","Electrical","Electronics","Chemical","Aerospace","Biotechnology","Other"];
const CATEGORIES = ["Notes","PYQs","Lab Manuals","Mini Projects","CAD Files","Drawing Kits","Books","Coding Resources"];
const CATEGORY_EMOJI = {
  "Notes":"📝","PYQs":"📄","Lab Manuals":"🔬","Mini Projects":"🛠️","CAD Files":"📐","Drawing Kits":"✏️","Books":"📚","Coding Resources":"💻"
};

const STATUS_BADGE = {
  pending: "badge-orange",
  approved: "badge-green",
  rejected: "badge-red",
};

function UploadModal({ onClose, onSuccess, api, editing }) {
  const [form, setForm] = useState(editing || {
    title:"", description:"", branch:"CS", subject:"", semester:"1",
    category:"Notes", type:"digital", price:"0", tags:"",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Use FormData to support file uploads in real integration
      const method = editing ? "PUT" : "POST";
      const path   = editing ? `/resources/${editing._id}` : "/resources";
      const data = await api(path, {
        method,
        body: JSON.stringify({
          ...form,
          semester: Number(form.semester),
          price: Number(form.price),
        }),
      });
      if (data.resource || data.message?.includes("uploaded") || data.message?.includes("updated")) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{editing ? "Edit Resource" : "Upload New Resource"}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{marginBottom:16}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Title</label>
              <input className="form-input" placeholder="e.g. Data Structures Notes – Unit 3" value={form.title}
                onChange={e => set("title", e.target.value)} required />
            </div>

            <div className="form-group full">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Describe what's included, topics covered, etc."
                value={form.description} onChange={e => set("description", e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Branch</label>
              <select className="form-select" value={form.branch} onChange={e => set("branch", e.target.value)}>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" placeholder="e.g. Data Structures" value={form.subject}
                onChange={e => set("subject", e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Semester</label>
              <select className="form-select" value={form.semester} onChange={e => set("semester", e.target.value)}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
                <option value="digital">Digital (download)</option>
                <option value="physical">Physical (pickup/delivery)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input className="form-input" type="number" min="0" placeholder="0 for free"
                value={form.price} onChange={e => set("price", e.target.value)} />
            </div>

            <div className="form-group full">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" placeholder="e.g. exam, unit3, binary trees"
                value={form.tags} onChange={e => set("tags", e.target.value)} />
            </div>

            <div className="form-group full">
              <label className="form-label">File URL (Cloudinary / Drive link)</label>
              <input className="form-input" placeholder="https://…" value={form.fileURL || ""}
                onChange={e => set("fileURL", e.target.value)} />
              <span style={{fontSize:"0.78rem",color:"var(--ink-4)"}}>In production, use the file upload field. Enter a direct URL for now.</span>
            </div>
          </div>

          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={loading}>
              {loading ? <><span className="spinner" />Uploading…</> : editing ? "Save Changes" : "Upload Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SellerDashboard({ user, token, api, onLogout, onSwitch }) {
  const [tab, setTab] = useState("listings");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [msg, setMsg] = useState("");

  const loadMyResources = async () => {
    setLoading(true);
    const data = await api("/resources/my");
    setResources(data.resources || []);
    setLoading(false);
  };

  useEffect(() => { loadMyResources(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    const data = await api(`/resources/${id}`, { method: "DELETE" });
    setMsg(data.message);
    loadMyResources();
  };

  // Stats derived from own resources
  const approved = resources.filter(r => r.approved === "approved").length;
  const pending  = resources.filter(r => r.approved === "pending").length;
  const rejected = resources.filter(r => r.approved === "rejected").length;
  const totalDownloads = resources.reduce((s, r) => s + (r.downloads || 0), 0);
  const estimatedEarnings = resources
    .filter(r => r.approved === "approved")
    .reduce((s, r) => s + (r.price * (r.downloads || 0)), 0);

  return (
    <div className="page">
      <nav className="topnav">
        <div className="topnav-logo">Edu<span>Bazzar</span></div>
        <div className="topnav-role-badge seller">Seller</div>
        <div className="topnav-spacer" />
        <div className="topnav-user">
          <span style={{color:"var(--ink-3)",fontSize:"0.85rem"}}>{user?.branch}</span>
          <div className="topnav-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <button className="btn btn-ghost btn-sm" onClick={onSwitch}>Switch</button>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
        </div>
      </nav>

      <div className="container section">
        {msg && (
          <div className="alert alert-success" style={{marginBottom:16}}>
            {msg} <button style={{float:"right",background:"none",border:"none",cursor:"pointer",fontSize:"1rem"}} onClick={() => setMsg("")}>✕</button>
          </div>
        )}

        <div className="tabs">
          {[["listings","📋 My Listings"],["analytics","📊 Analytics"],["profile","👤 Profile"]].map(([k,l]) => (
            <button key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {/* ── MY LISTINGS ── */}
        {tab === "listings" && (
          <div className="animate-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div className="page-title">My Listings</div>
                <p className="page-subtitle">All resources you've uploaded</p>
              </div>
              <button className="btn btn-accent" onClick={() => { setEditing(null); setShowUpload(true); }}>
                + Upload Resource
              </button>
            </div>

            {loading ? (
              <div style={{textAlign:"center",padding:"60px 0"}}><span className="spinner spinner-dark" style={{width:32,height:32}} /></div>
            ) : resources.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📤</div>
                <div className="empty-title">No resources yet</div>
                <p>Click "Upload Resource" to add your first listing</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>Title</th><th>Category</th><th>Branch</th><th>Sem</th><th>Price</th><th>Downloads</th><th>Status</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {resources.map(r => (
                      <tr key={r._id}>
                        <td>
                          <strong style={{fontSize:"0.92rem"}}>{r.title}</strong>
                          <div style={{fontSize:"0.78rem",color:"var(--ink-4)",marginTop:2}}>{r.subject}</div>
                        </td>
                        <td><span className="badge badge-blue">{CATEGORY_EMOJI[r.category]} {r.category}</span></td>
                        <td>{r.branch}</td>
                        <td>Sem {r.semester}</td>
                        <td><strong>{r.price === 0 ? <span style={{color:"var(--green)"}}>Free</span> : `₹${r.price}`}</strong></td>
                        <td>⬇ {r.downloads}</td>
                        <td><span className={`badge ${STATUS_BADGE[r.approved]}`}>{r.approved}</span></td>
                        <td>
                          <div style={{display:"flex",gap:6}}>
                            <button className="btn btn-outline btn-sm" onClick={() => { setEditing(r); setShowUpload(true); }}>Edit</button>
                            <button className="btn btn-sm" style={{background:"#fde8e8",color:"#c0392b",border:"1px solid #f5c6c6"}}
                              onClick={() => handleDelete(r._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === "analytics" && (
          <div className="animate-in">
            <div className="page-title">Analytics</div>
            <p className="page-subtitle">Performance overview of your listings</p>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📤</div>
                <div className="stat-label">Total Uploads</div>
                <div className="stat-value">{resources.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-label">Approved</div>
                <div className="stat-value" style={{color:"var(--green)"}}>{approved}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-label">Pending</div>
                <div className="stat-value" style={{color:"var(--warn)"}}>{pending}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⬇</div>
                <div className="stat-label">Total Downloads</div>
                <div className="stat-value">{totalDownloads}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-label">Est. Earnings</div>
                <div className="stat-value" style={{fontSize:"1.4rem"}}>₹{estimatedEarnings}</div>
              </div>
            </div>

            {resources.length > 0 && (
              <div className="card" style={{marginTop:20}}>
                <div style={{fontFamily:"var(--font-display)",fontWeight:700,marginBottom:16}}>Resource Performance</div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {resources.filter(r => r.approved === "approved").sort((a,b) => b.downloads - a.downloads).slice(0,5).map(r => (
                    <div key={r._id} style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:"0.88rem",fontWeight:600}}>{r.title}</div>
                        <div style={{fontSize:"0.78rem",color:"var(--ink-4)"}}>{r.category} · {r.branch}</div>
                      </div>
                      <div style={{minWidth:120}}>
                        <div style={{height:6,background:"var(--paper-3)",borderRadius:3,overflow:"hidden"}}>
                          <div style={{
                            height:"100%",
                            width: `${Math.min(100, ((r.downloads / (resources.reduce((m,x) => Math.max(m,x.downloads), 1))) * 100))}%`,
                            background:"var(--accent)",
                            borderRadius:3,
                            transition:"width 0.4s ease"
                          }} />
                        </div>
                      </div>
                      <div style={{fontSize:"0.85rem",color:"var(--ink-3)",width:70,textAlign:"right"}}>⬇ {r.downloads}</div>
                      <div style={{fontSize:"0.85rem",fontWeight:600,width:60,textAlign:"right"}}>
                        {r.price === 0 ? <span style={{color:"var(--green)"}}>Free</span> : `₹${r.price}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rejected > 0 && (
              <div className="alert alert-error" style={{marginTop:16}}>
                <strong>{rejected} resource(s) were rejected.</strong> Edit and resubmit them for admin approval.
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <div className="animate-in" style={{maxWidth:480}}>
            <div className="page-title">My Profile</div>
            <p className="page-subtitle">Your account information</p>
            <div className="card">
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
                <div style={{
                  width:60,height:60,borderRadius:"50%",background:"var(--ink)",color:"#fff",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:"var(--font-display)",fontSize:"1.5rem",fontWeight:800
                }}>{user?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.1rem"}}>{user?.name}</div>
                  <div style={{color:"var(--ink-3)",fontSize:"0.88rem"}}>{user?.email}</div>
                </div>
              </div>
              <hr className="divider" />
              {[
                ["Role", user?.role],
                ["Branch", user?.branch],
                ["College", user?.college || "Not set"],
                ["Member since", new Date(user?.createdAt).toLocaleDateString()],
              ].map(([k,v]) => (
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--paper-3)"}}>
                  <span style={{color:"var(--ink-3)",fontSize:"0.88rem"}}>{k}</span>
                  <span style={{fontWeight:600,fontSize:"0.88rem"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => { setShowUpload(false); setEditing(null); }}
          onSuccess={loadMyResources}
          api={api}
          editing={editing}
        />
      )}
    </div>
  );
}
