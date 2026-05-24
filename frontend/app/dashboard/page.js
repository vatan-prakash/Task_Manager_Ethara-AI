"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Navbar";
import { api, getUser } from "../../lib/api";

const STATUS = ["To Do", "In Progress", "Done"];
const pillClass = (s) =>
  s === "Done" ? "s-done" : s === "In Progress" ? "s-progress" : "s-todo";

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, t] = await Promise.all([api.dashboard(), api.getTasks()]);
      setStats(s);
      setTasks(t);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
    load();
  }, [router]);

  const changeStatus = async (id, status) => {
    
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));
    try {
      await api.updateTask(id, { status });
      // stats refresh  (overdue/done counts will change) - at background 
      api.dashboard().then(setStats).catch(() => {});
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  const isOverdue = (t) =>
    t.dueDate && t.status !== "Done" && new Date(t.dueDate) < new Date();

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="flex-between">
          <h2 style={{ color: "#fff" }}>Dashboard</h2>
        </div>

        {error && <p className="error">{error}</p>}

        {stats && (
          <div className="stats" style={{ marginTop: 16 }}>
            <div className="stat"><div className="num">{stats.total}</div><div className="lbl">Total Tasks</div></div>
            <div className="stat"><div className="num">{stats.todo}</div><div className="lbl">To Do</div></div>
            <div className="stat progress"><div className="num">{stats.inProgress}</div><div className="lbl">In Progress</div></div>
            <div className="stat done"><div className="num">{stats.done}</div><div className="lbl">Done</div></div>
            <div className="stat overdue"><div className="num">{stats.overdue}</div><div className="lbl">Overdue</div></div>
          </div>
        )}

        <h3 className="section-title">
          {user?.role === "Admin" ? "All Tasks (your projects)" : "My Tasks"}
        </h3>

        {tasks.length === 0 ? (
          <div className="card empty">{loading ? "Loading..." : "No tasks yet."}</div>
        ) : (
          tasks.map((t) => (
            <div className="row" key={t._id}>
              <div className="info">
                <div className="title">{t.title}</div>
                <div className="meta">
                  Project: {t.project?.name || "—"}
                  {t.assignedTo ? ` • Assigned: ${t.assignedTo.name}` : " • Unassigned"}
                  {t.dueDate ? ` • Due: ${new Date(t.dueDate).toLocaleDateString()}` : ""}
                  {isOverdue(t) && <span className="overdue-tag"> • OVERDUE</span>}
                </div>
              </div>
              <span className={`status-pill ${pillClass(t.status)}`}>{t.status}</span>
              <select
                value={t.status}
                onChange={(e) => changeStatus(t._id, e.target.value)}
                style={{ width: "auto" }}
              >
                {STATUS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
    </>
  );
}