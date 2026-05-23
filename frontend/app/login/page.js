"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, saveAuth } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      saveAuth(data.token, data.user);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-box">
        <h1>Welcome back 👋</h1>
        <p className="sub">Login to your Task Manager account</p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {error && <p className="error">{error}</p>}

        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ marginTop: 16, fontSize: 14, color: "var(--muted)" }}>
          No account? <a className="muted-link" href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}
