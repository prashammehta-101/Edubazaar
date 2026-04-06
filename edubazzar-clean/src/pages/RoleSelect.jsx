export default function RoleSelect({ user, onSelect, onLogout }) {
  return (
    <div className="roleselect-page">
      <div className="roleselect-nav">
        <div className="auth-brand-logo">Edu<span>Bazzar</span></div>
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
      </div>

      <div className="roleselect-body animate-in">
        <div className="roleselect-greeting">
          <div className="greeting-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div>
            <h2>Hello, {user?.name?.split(" ")[0]} 👋</h2>
            <p>What would you like to do today?</p>
          </div>
        </div>

        <div className="roleselect-cards">
          <button className="role-card buyer-card" onClick={() => onSelect("buyer")}>
            <div className="role-card-icon">🛒</div>
            <h3>Browse & Buy</h3>
            <p>Explore thousands of notes, PYQs, lab manuals, and more from your peers.</p>
            <ul>
              <li>✓ Search by branch, semester, subject</li>
              <li>✓ Purchase &amp; download instantly</li>
              <li>✓ Wishlist your favourites</li>
              <li>✓ Leave reviews</li>
            </ul>
            <div className="role-card-cta">Go to Buyer Dashboard →</div>
          </button>

          <button className="role-card seller-card" onClick={() => onSelect("seller")}>
            <div className="role-card-icon">📤</div>
            <h3>Upload &amp; Sell</h3>
            <p>Monetise your hard work by selling your study materials to fellow students.</p>
            <ul>
              <li>✓ Upload digital or physical listings</li>
              <li>✓ Set your own price</li>
              <li>✓ Track downloads &amp; earnings</li>
              <li>✓ Manage all your listings</li>
            </ul>
            <div className="role-card-cta">Go to Seller Dashboard →</div>
          </button>
        </div>

        <p className="roleselect-hint">
          Registered as <strong>{user?.role}</strong> · {user?.branch} · {user?.college || "College not set"}
        </p>
      </div>

      <style>{`
        .roleselect-page {
          min-height: 100vh;
          background: var(--paper);
          display: flex;
          flex-direction: column;
        }
        .roleselect-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 32px;
          height: 64px;
          border-bottom: 1px solid var(--border);
          background: rgba(248,246,241,0.9);
          backdrop-filter: blur(10px);
        }
        .auth-brand-logo {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.03em;
        }
        .auth-brand-logo span { color: var(--accent); }
        .roleselect-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          gap: 32px;
        }
        .roleselect-greeting {
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: left;
        }
        .greeting-avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: var(--ink);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .roleselect-greeting h2 {
          font-family: var(--font-display);
          font-size: 1.7rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }
        .roleselect-greeting p { color: var(--ink-3); }
        .roleselect-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          width: 100%;
          max-width: 740px;
        }
        .role-card {
          background: #fff;
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px 24px;
          cursor: pointer;
          text-align: left;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-family: var(--font-body);
        }
        .role-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
        }
        .buyer-card:hover { border-color: var(--ink); }
        .seller-card:hover { border-color: var(--accent); }
        .role-card-icon { font-size: 2.5rem; }
        .role-card h3 {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--ink);
        }
        .role-card p { font-size: 0.88rem; color: var(--ink-3); line-height: 1.5; }
        .role-card ul { list-style: none; display: flex; flex-direction: column; gap: 5px; }
        .role-card ul li { font-size: 0.85rem; color: var(--ink-2); }
        .role-card-cta {
          margin-top: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--ink);
        }
        .seller-card .role-card-cta { color: var(--accent); }
        .roleselect-hint {
          font-size: 0.85rem;
          color: var(--ink-4);
        }
        @media (max-width: 600px) {
          .roleselect-cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
