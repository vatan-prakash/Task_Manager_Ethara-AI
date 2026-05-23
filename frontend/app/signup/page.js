"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, saveAuth } from "../../lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Member" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await api.signup(form);
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
        <h1>Create account ✨</h1>
        <p className="sub">Start managing your team's tasks</p>

        <label>Full Name</label>
        <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" />

        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />

        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="min 6 characters" />

        <label>Role</label>
        <select value={form.role} onChange={(e) => update("role", e.target.value)}>
          <option value="Member">Member</option>
          <option value="Admin">Admin</option>
        </select>

        {error && <p className="error">{error}</p>}

        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p style={{ marginTop: 16, fontSize: 14, color: "var(--muted)" }}>
          Already have an account? <a className="muted-link" href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
