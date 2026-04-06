import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import RoleSelect from "./pages/RoleSelect";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState("auth"); // auth | roleSelect | buyer | seller | admin

  const handleAuthSuccess = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    setView("roleSelect");
  };

  const handleRoleSelect = (role) => {
    setView(role); // "buyer" or "seller"
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setView("auth");
  };

  const api = async (path, options = {}) => {
    const res = await fetch(`http://localhost:5000/api${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    return res.json();
  };

  if (view === "auth") return <AuthPage onSuccess={handleAuthSuccess} />;
  if (view === "roleSelect") return <RoleSelect user={user} onSelect={handleRoleSelect} onLogout={handleLogout} />;
  if (view === "buyer") return <BuyerDashboard user={user} token={token} api={api} onLogout={handleLogout} onSwitch={() => setView("roleSelect")} />;
  if (view === "seller") return <SellerDashboard user={user} token={token} api={api} onLogout={handleLogout} onSwitch={() => setView("roleSelect")} />;
  if (view === "admin") return <AdminDashboard user={user} api={api} onLogout={handleLogout} onSwitch={() => setView("roleSelect")} />;
}
