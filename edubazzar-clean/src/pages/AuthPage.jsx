import { useState } from "react";

const API = "http://localhost:5000/api";

const BRANCHES = ["CS","IT","Mechanical","Civil","Electrical","Electronics","Chemical","Aerospace","Biotechnology","Other"];

export default function AuthPage({ onSuccess }) {
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"buyer", branch:"Other", college:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : form;
      const res = await fetch(`${API}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || (data.errors?.[0]?.msg) || "Something went wrong.");
      } else {
        onSuccess(data.user, data.token);
      }
    } catch {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-brand-logo">Edu<span>Bazzar</span></div>
          <p className="auth-brand-tag">The student marketplace for educational resources</p>
        </div>
        <div className="auth-features">
          {["📚 Buy notes, PYQs, lab manuals & more", "📤 Sell your own study materials", "🎓 Filter by branch, semester & subject", "⭐ Rate & review resources"].map(f => (
            <div key={f} className="auth-feature-item">{f}</div>
          ))}
        </div>
        <div className="auth-left-deco">
          <div className="deco-circle c1" />
          <div className="deco-circle c2" />
          <div className="deco-circle c3" />
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card animate-in">
          <div className="auth-card-header">
            <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
            <p>{mode === "login" ? "Sign in to continue" : "Join EduBazzar today"}</p>
          </div>

          {error && <div className="alert alert-error" style={{marginBottom:16}}>{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="Your name" value={form.name}
                    onChange={e => set("name", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">I want to</label>
                  <div className="role-toggle">
                    <button type="button" className={`role-btn ${form.role==="buyer"?"active":""}`} onClick={() => set("role","buyer")}>
                      🛒 Buy Resources
                    </button>
                    <button type="button" className={`role-btn ${form.role==="seller"?"active":""}`} onClick={() => set("role","seller")}>
                      📤 Sell Resources
                    </button>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={form.branch} onChange={e => set("branch", e.target.value)}>
                      {BRANCHES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">College</label>
                    <input className="form-input" placeholder="College name" value={form.college}
                      onChange={e => set("college", e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@college.edu" value={form.email}
                onChange={e => set("email", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => set("password", e.target.value)} required minLength={6} />
            </div>

            <button type="submit" className="btn btn-accent btn-lg" style={{width:"100%",justifyContent:"center"}} disabled={loading}>
              {loading ? <><span className="spinner" /> Processing…</> : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="auth-toggle">
            {mode === "login" ? (
              <p>Don't have an account? <button onClick={() => { setMode("register"); setError(""); }}>Sign up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => { setMode("login"); setError(""); }}>Sign in</button></p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
        }
        .auth-left {
          flex: 0 0 420px;
          background: var(--ink);
          padding: 48px 44px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .auth-brand-logo {
          font-family: var(--font-display);
          font-size: 2.4rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          margin-bottom: 12px;
        }
        .auth-brand-logo span { color: var(--accent); }
        .auth-brand-tag { color: rgba(255,255,255,0.55); font-size: 1rem; line-height: 1.5; }
        .auth-features { display: flex; flex-direction: column; gap: 14px; }
        .auth-feature-item {
          font-size: 0.92rem;
          color: rgba(255,255,255,0.75);
          padding: 12px 16px;
          background: rgba(255,255,255,0.06);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s;
        }
        .auth-feature-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .deco-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.06;
          background: var(--accent);
        }
        .c1 { width: 320px; height: 320px; bottom: -80px; right: -80px; }
        .c2 { width: 180px; height: 180px; top: 60px; right: -40px; opacity: 0.04; }
        .c3 { width: 80px; height: 80px; bottom: 200px; left: -20px; opacity: 0.08; }
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: var(--paper);
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: var(--radius-lg);
          padding: 36px;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
        }
        .auth-card-header { margin-bottom: 24px; }
        .auth-card-header h1 {
          font-family: var(--font-display);
          font-size: 1.7rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .auth-card-header p { color: var(--ink-3); font-size: 0.92rem; }
        .auth-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
        .role-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .role-btn {
          padding: 11px 10px;
          border-radius: var(--radius);
          border: 1.5px solid var(--border);
          background: transparent;
          font-family: var(--font-body);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--ink-3);
        }
        .role-btn.active {
          border-color: var(--ink);
          background: var(--ink);
          color: #fff;
        }
        .auth-toggle {
          text-align: center;
          font-size: 0.9rem;
          color: var(--ink-3);
        }
        .auth-toggle button {
          background: none;
          border: none;
          color: var(--accent);
          font-weight: 600;
          cursor: pointer;
          font-size: inherit;
        }
        .auth-toggle button:hover { text-decoration: underline; }
        @media (max-width: 820px) {
          .auth-left { display: none; }
        }
      `}</style>
    </div>
  );
}
