import { useState, useEffect, useCallback } from "react";
import ResourceDetailModal from "../components/ResourceDetailModal";

const BRANCHES = ["CS","IT","Mechanical","Civil","Electrical","Electronics","Chemical","Aerospace","Biotechnology","Other"];
const CATEGORIES = ["Notes","PYQs","Lab Manuals","Mini Projects","CAD Files","Drawing Kits","Books","Coding Resources"];
const CATEGORY_EMOJI = {
  "Notes":"📝","PYQs":"📄","Lab Manuals":"🔬","Mini Projects":"🛠️","CAD Files":"📐","Drawing Kits":"✏️","Books":"📚","Coding Resources":"💻"
};

export default function BuyerDashboard({ user, token, api, onLogout, onSwitch }) {
  const [tab, setTab] = useState("browse");
  const [resources, setResources] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ search:"", branch:"", semester:"", category:"", sort:"createdAt" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const setF = (k, v) => { setFilters(f => ({...f, [k]: v})); setPage(1); };

  const loadResources = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (filters.search)   params.set("search", filters.search);
    if (filters.branch)   params.set("branch", filters.branch);
    if (filters.semester) params.set("semester", filters.semester);
    if (filters.category) params.set("category", filters.category);
    if (filters.sort)     params.set("sort", filters.sort);
    const data = await api(`/resources?${params}`);
    setResources(data.resources || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [filters, page]);

  const loadTransactions = async () => {
    const data = await api("/transactions/my");
    setTransactions(data.transactions || []);
  };

  const loadWishlist = async () => {
    const data = await api("/wishlist");
    setWishlist(data.wishlist?.resources || []);
  };

  const loadRecommended = async () => {
    const data = await api("/resources/recommended");
    setRecommended(data.resources || []);
  };

  useEffect(() => { loadResources(); }, [loadResources]);
  useEffect(() => { loadTransactions(); loadWishlist(); loadRecommended(); }, []);

  const toggleWishlist = async (resourceId, e) => {
    e?.stopPropagation();
    await api(`/wishlist/${resourceId}`, { method: "POST" });
    loadWishlist();
  };

  const isInWishlist = (id) => wishlist.some(r => (r._id || r) === id);
  const hasPurchased = (id) => transactions.some(t => (t.resourceId?._id || t.resourceId) === id && t.paymentStatus === "success");

  const purchase = async (resourceId) => {
    const data = await api("/transactions/purchase", { method:"POST", body: JSON.stringify({ resourceId }) });
    if (data.transaction) { loadTransactions(); return { ok: true, msg: data.message }; }
    return { ok: false, msg: data.message };
  };

  return (
    <div className="page">
      {/* NAV */}
      <nav className="topnav">
        <div className="topnav-logo">Edu<span>Bazzar</span></div>
        <div className="topnav-role-badge">Buyer</div>
        <div className="topnav-spacer" />
        <div className="topnav-user">
          <span style={{color:"var(--ink-3)", fontSize:"0.85rem"}}>{user?.branch}</span>
          <div className="topnav-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <button className="btn btn-ghost btn-sm" onClick={onSwitch}>Switch</button>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
        </div>
      </nav>

      <div className="container section">
        {/* TABS */}
        <div className="tabs">
          {[["browse","🔍 Browse"],["purchases","🛒 My Purchases"],["wishlist","❤️ Wishlist"],["recommended","⭐ Recommended"]].map(([k,l]) => (
            <button key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {/* ── BROWSE ── */}
        {tab === "browse" && (
          <div className="animate-in">
            <div className="page-title">Browse Resources</div>
            <p className="page-subtitle">Discover notes, PYQs, lab manuals and more</p>

            <div className="filter-bar">
              <div className="search-input-wrap" style={{flex:"1 1 240px"}}>
                <span className="search-icon">🔍</span>
                <input className="form-input" placeholder="Search by title, subject, keywords…"
                  value={filters.search} onChange={e => setF("search", e.target.value)} />
              </div>
              <select className="form-select" style={{width:130}} value={filters.branch} onChange={e => setF("branch", e.target.value)}>
                <option value="">All Branches</option>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
              <select className="form-select" style={{width:130}} value={filters.semester} onChange={e => setF("semester", e.target.value)}>
                <option value="">All Sems</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
              <select className="form-select" style={{width:160}} value={filters.category} onChange={e => setF("category", e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="form-select" style={{width:140}} value={filters.sort} onChange={e => setF("sort", e.target.value)}>
                <option value="createdAt">Newest</option>
                <option value="price_asc">Price: Low→High</option>
                <option value="price_desc">Price: High→Low</option>
                <option value="downloads">Most Downloaded</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {loading ? (
              <div style={{textAlign:"center", padding:"60px 0"}}>
                <span className="spinner spinner-dark" style={{width:32,height:32}} />
              </div>
            ) : resources.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">No resources found</div>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="resource-grid">
                  {resources.map(r => (
                    <ResourceCard key={r._id} resource={r}
                      wishlisted={isInWishlist(r._id)}
                      purchased={hasPurchased(r._id)}
                      onToggleWishlist={toggleWishlist}
                      onClick={() => setSelected(r)} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div style={{display:"flex", justifyContent:"center", gap:8, marginTop:28}}>
                    <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>← Prev</button>
                    <span style={{padding:"8px 16px", fontSize:"0.9rem", color:"var(--ink-3)"}}>Page {page} / {totalPages}</span>
                    <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── PURCHASES ── */}
        {tab === "purchases" && (
          <div className="animate-in">
            <div className="page-title">My Purchases</div>
            <p className="page-subtitle">Resources you've bought</p>
            {transactions.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🛒</div><div className="empty-title">No purchases yet</div><p>Browse the marketplace to find resources</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>Resource</th><th>Category</th><th>Branch</th><th>Amount</th><th>Date</th><th>Action</th>
                  </tr></thead>
                  <tbody>
                    {transactions.map(t => {
                      const r = t.resourceId;
                      return (
                        <tr key={t._id}>
                          <td><strong>{r?.title || "Deleted resource"}</strong></td>
                          <td>{r?.category ? <span className="badge badge-blue">{CATEGORY_EMOJI[r.category]} {r.category}</span> : "—"}</td>
                          <td>{r?.branch || "—"}</td>
                          <td>{t.amount === 0 ? <span className="badge badge-green">Free</span> : <strong>₹{t.amount}</strong>}</td>
                          <td style={{color:"var(--ink-3)", fontSize:"0.85rem"}}>{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-primary btn-sm" onClick={async () => {
                              const data = await api(`/resources/${r?._id}/download`);
                              if (data.fileURL) window.open(data.fileURL, "_blank");
                              else alert(data.message || "No file available");
                            }}>⬇ Download</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── WISHLIST ── */}
        {tab === "wishlist" && (
          <div className="animate-in">
            <div className="page-title">My Wishlist</div>
            <p className="page-subtitle">Resources you've saved</p>
            {wishlist.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">❤️</div><div className="empty-title">Your wishlist is empty</div><p>Heart resources while browsing to save them here</p></div>
            ) : (
              <div className="resource-grid">
                {wishlist.filter(r => r._id).map(r => (
                  <ResourceCard key={r._id} resource={r} wishlisted={true}
                    purchased={hasPurchased(r._id)}
                    onToggleWishlist={toggleWishlist}
                    onClick={() => setSelected(r)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RECOMMENDED ── */}
        {tab === "recommended" && (
          <div className="animate-in">
            <div className="page-title">Recommended for You</div>
            <p className="page-subtitle">Popular resources in {user?.branch}</p>
            {recommended.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">⭐</div><div className="empty-title">Nothing here yet</div><p>Recommendations are based on your branch</p></div>
            ) : (
              <div className="resource-grid">
                {recommended.map(r => (
                  <ResourceCard key={r._id} resource={r}
                    wishlisted={isInWishlist(r._id)}
                    purchased={hasPurchased(r._id)}
                    onToggleWishlist={toggleWishlist}
                    onClick={() => setSelected(r)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <ResourceDetailModal
          resource={selected}
          onClose={() => setSelected(null)}
          api={api}
          purchased={hasPurchased(selected._id)}
          wishlisted={isInWishlist(selected._id)}
          onPurchase={purchase}
          onToggleWishlist={toggleWishlist}
          onPurchaseSuccess={() => { loadTransactions(); }}
        />
      )}
    </div>
  );
}

function ResourceCard({ resource: r, wishlisted, purchased, onToggleWishlist, onClick }) {
  const CATEGORY_EMOJI = {
    "Notes":"📝","PYQs":"📄","Lab Manuals":"🔬","Mini Projects":"🛠️","CAD Files":"📐","Drawing Kits":"✏️","Books":"📚","Coding Resources":"💻"
  };
  return (
    <div className="resource-card" onClick={onClick}>
      <div className="resource-card-img">
        {r.imageURL ? <img src={r.imageURL} alt={r.title} /> : (
          <span style={{fontSize:"3rem", opacity:0.4}}>{CATEGORY_EMOJI[r.category] || "📁"}</span>
        )}
        {purchased && (
          <div style={{position:"absolute",top:8,left:8}}>
            <span className="badge badge-green">✓ Owned</span>
          </div>
        )}
      </div>
      <div className="resource-card-body">
        <div className="resource-card-title">{r.title}</div>
        <div className="resource-card-meta">
          <span className="badge badge-gray">{r.branch}</span>
          <span className="badge badge-blue">{CATEGORY_EMOJI[r.category]} {r.category}</span>
          {r.semester && <span className="badge badge-gray">Sem {r.semester}</span>}
        </div>
        <div style={{fontSize:"0.82rem", color:"var(--ink-3)", marginBottom:8}}>
          by {r.sellerId?.name || "Unknown"}
        </div>
        <div className="resource-card-footer">
          <div>
            <div className={`resource-price ${r.price === 0 ? "free" : ""}`}>
              {r.price === 0 ? "Free" : `₹${r.price}`}
            </div>
            {r.totalReviews > 0 && (
              <div className="resource-rating">
                ⭐ {r.averageRating} ({r.totalReviews})
              </div>
            )}
          </div>
          <button className={`wishlist-btn ${wishlisted?"active":""}`}
            onClick={e => onToggleWishlist(r._id, e)}>
            {wishlisted ? "❤️" : "🤍"}
          </button>
        </div>
      </div>
    </div>
  );
}
