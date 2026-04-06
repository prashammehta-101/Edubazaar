import { useState, useEffect } from "react";

const CATEGORY_EMOJI = {
  "Notes":"📝","PYQs":"📄","Lab Manuals":"🔬","Mini Projects":"🛠️","CAD Files":"📐","Drawing Kits":"✏️","Books":"📚","Coding Resources":"💻"
};

export default function ResourceDetailModal({ resource: r, onClose, api, purchased, wishlisted, onPurchase, onToggleWishlist, onPurchaseSuccess }) {
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");
  const [buying, setBuying] = useState(false);
  const [buyMsg, setBuyMsg] = useState("");
  const [ownedNow, setOwnedNow] = useState(purchased);

  useEffect(() => {
    api(`/reviews/${r._id}`).then(d => setReviews(d.reviews || []));
  }, [r._id]);

  const handlePurchase = async () => {
    setBuying(true);
    const result = await onPurchase(r._id);
    setBuyMsg(result.msg);
    if (result.ok) {
      setOwnedNow(true);
      onPurchaseSuccess?.();
    }
    setBuying(false);
  };

  const handleDownload = async () => {
    const data = await api(`/resources/${r._id}/download`);
    if (data.fileURL) window.open(data.fileURL, "_blank");
    else alert(data.message || "No file available.");
  };

  const handleReview = async (e) => {
    e.preventDefault();
    const data = await api(`/reviews/${r._id}`, {
      method: "POST",
      body: JSON.stringify(reviewForm),
    });
    setReviewMsg(data.message);
    if (data.review) {
      api(`/reviews/${r._id}`).then(d => setReviews(d.reviews || []));
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth:620}}>
        <div className="modal-header">
          <div className="modal-title">{CATEGORY_EMOJI[r.category]} {r.category}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {r.imageURL && (
          <div style={{borderRadius:"var(--radius)",overflow:"hidden",marginBottom:16,height:180}}>
            <img src={r.imageURL} alt={r.title} style={{width:"100%",height:"100%",objectFit:"cover"}} />
          </div>
        )}

        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.3rem",fontWeight:800,marginBottom:10}}>{r.title}</h2>

        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
          <span className="badge badge-gray">{r.branch}</span>
          <span className="badge badge-gray">Sem {r.semester}</span>
          <span className="badge badge-blue">{r.subject}</span>
          <span className="badge badge-gray">{r.type}</span>
          {r.tags?.map(t => <span key={t} className="badge badge-gray">#{t}</span>)}
        </div>

        <p style={{fontSize:"0.92rem",color:"var(--ink-2)",lineHeight:1.6,marginBottom:16}}>{r.description}</p>

        <div style={{display:"flex",gap:20,marginBottom:16,fontSize:"0.85rem",color:"var(--ink-3)"}}>
          <span>👤 {r.sellerId?.name || "Unknown"}</span>
          {r.sellerId?.college && <span>🏫 {r.sellerId.college}</span>}
          <span>⬇ {r.downloads} downloads</span>
          {r.totalReviews > 0 && <span>⭐ {r.averageRating} ({r.totalReviews} reviews)</span>}
        </div>

        <hr className="divider" />

        {/* PURCHASE SECTION */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",fontWeight:800}}>
            {r.price === 0 ? <span style={{color:"var(--green)"}}>Free</span> : `₹${r.price}`}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className={`wishlist-btn ${wishlisted?"active":""}`} onClick={e => onToggleWishlist(r._id, e)}>
              {wishlisted ? "❤️" : "🤍"}
            </button>
            {ownedNow || r.price === 0 ? (
              <button className="btn btn-primary" onClick={handleDownload}>⬇ Download</button>
            ) : (
              <button className="btn btn-accent" onClick={handlePurchase} disabled={buying}>
                {buying ? <><span className="spinner" />Processing…</> : `Buy for ₹${r.price}`}
              </button>
            )}
          </div>
        </div>
        {buyMsg && <div className={`alert ${buyMsg.includes("success") || buyMsg.toLowerCase().includes("success") || ownedNow ? "alert-success" : "alert-error"}`} style={{marginBottom:12}}>{buyMsg}</div>}

        <hr className="divider" />

        {/* REVIEWS */}
        <div>
          <div style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem",marginBottom:12}}>
            Reviews ({reviews.length})
          </div>
          {reviews.length === 0 ? (
            <p style={{color:"var(--ink-4)",fontSize:"0.9rem",marginBottom:12}}>No reviews yet. Be the first!</p>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16,maxHeight:200,overflowY:"auto"}}>
              {reviews.map(rv => (
                <div key={rv._id} style={{background:"var(--paper-2)",borderRadius:"var(--radius)",padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <strong style={{fontSize:"0.88rem"}}>{rv.userId?.name || "User"}</strong>
                    <span>{"⭐".repeat(rv.rating)}</span>
                  </div>
                  <p style={{fontSize:"0.85rem",color:"var(--ink-2)"}}>{rv.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Leave a review — only if purchased */}
          {(ownedNow || r.price === 0) && (
            <form onSubmit={handleReview}>
              <div style={{fontWeight:600,fontSize:"0.85rem",marginBottom:8,color:"var(--ink-3)"}}>Leave a Review</div>
              <div style={{display:"flex",gap:4,marginBottom:10}}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="star" style={{color: s <= reviewForm.rating ? "#f5a623" : "#ccc"}}
                    onClick={() => setReviewForm(f => ({...f, rating:s}))}>★</span>
                ))}
              </div>
              <textarea className="form-textarea" placeholder="Share your thoughts…" style={{marginBottom:10}}
                value={reviewForm.comment} onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))} />
              {reviewMsg && <div className="alert alert-info" style={{marginBottom:8}}>{reviewMsg}</div>}
              <button type="submit" className="btn btn-outline btn-sm">Submit Review</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
