"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../Navbar";
import { api, getUser } from "../../../lib/api";

const STATUS = ["To Do", "In Progress", "Done"];
const pillClass = (s) =>
  s === "Done" ? "s-done" : s === "In Progress" ? "s-progress" : "s-todo";

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  // new task form
  const [title, setTitle] = useState("");
  const [tdesc, setTdesc] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  // EDIT task state - kaunsa task edit ho raha hai + uska form data
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "", description: "", assignedTo: "", dueDate: "",
  });

  const load = async () => {
    try {
      const [p, t] = await Promise.all([
        api.getProject(id),
        api.getTasksByProject(id),
      ]);
      setProject(p);
      setTasks(t);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
    load();
  }, [id, router]);

  const createTask = async () => {
    setError("");
    try {
      await api.createTask({
        title,
        description: tdesc,
        project: id,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
      });
      setTitle(""); setTdesc(""); setAssignedTo(""); setDueDate("");
      load();
    } catch (err) {
      setError(err.message);
    }
  };


  const changeStatus = async (taskId, status) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status } : t))
    );
    try {
      await api.updateTask(taskId, { status });
    } catch (err) {
      setError(err.message);
      load(); 
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
  
    const backup = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await api.deleteTask(taskId);
    } catch (err) {
      setError(err.message);
      setTasks(backup); 
    }
  };

  
  const startEdit = (t) => {
    setEditingId(t._id);
    setEditForm({
      title: t.title || "",
      description: t.description || "",
      assignedTo: t.assignedTo?._id || "",
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "", // yyyy-mm-dd for date input
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // EDIT save karo - title, desc, due date, AUR assign kisko (re-assign)
  const saveEdit = async (taskId) => {
    setError("");
    try {
      const updated = await api.updateTask(taskId, {
        title: editForm.title,
        description: editForm.description,
        assignedTo: editForm.assignedTo || null,
        dueDate: editForm.dueDate || null,
      });
   
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const isOverdue = (t) =>
    t.dueDate && t.status !== "Done" && new Date(t.dueDate) < new Date();

  if (!project) {
    return (
      <>
        <Navbar />
        <div className="container">
          {error ? <p className="error">{error}</p> : <p className="empty">Loading...</p>}
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <a className="muted-link" href="/projects">← Back to projects</a>
        <h2 style={{ color: "#fff", marginTop: 10 }}>{project.name}</h2>
        <p className="meta" style={{ color: "var(--muted)" }}>{project.description}</p>

        {error && <p className="error">{error}</p>}

        {/* Admin: create task */}
        {user?.role === "Admin" && (
          <div className="card" style={{ marginTop: 16 }}>
            <h3 className="section-title" style={{ marginTop: 0 }}>Add Task</h3>
            <div className="grid-2">
              <div>
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Build login page" />
              </div>
              <div>
                <label>Assign To</label>
                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                  <option value="">— Unassigned —</option>
                  {project.members?.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div>
                <label>Description</label>
                <input value={tdesc} onChange={(e) => setTdesc(e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <label>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <button className="btn" onClick={createTask}>Create Task</button>
          </div>
        )}

        <h3 className="section-title">Tasks</h3>
        {tasks.length === 0 ? (
          <div className="card empty">No tasks yet.</div>
        ) : (
          tasks.map((t) => {
            const canEditStatus =
              user?.role === "Admin" ||
              (t.assignedTo && t.assignedTo._id === user?.id);

            if (editingId === t._id && user?.role === "Admin") {
              return (
                <div className="card" key={t._id} style={{ marginBottom: 10 }}>
                  <h4 style={{ color: "#fff", marginBottom: 8 }}>✏️ Edit Task</h4>
                  <div className="grid-2">
                    <div>
                      <label>Title</label>
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Assign To (re-assign)</label>
                      <select
                        value={editForm.assignedTo}
                        onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                      >
                        <option value="">— Unassigned —</option>
                        {project.members?.map((m) => (
                          <option key={m._id} value={m._id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid-2">
                    <div>
                      <label>Description</label>
                      <input
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Due Date</label>
                      <input
                        type="date"
                        value={editForm.dueDate}
                        onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn btn-sm" style={{ marginTop: 0 }} onClick={() => saveEdit(t._id)}>Save</button>
                    <button className="btn btn-sm btn-secondary" style={{ marginTop: 0 }} onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              );
            }

            // normal task row
            return (
              <div className="row" key={t._id}>
                <div className="info">
                  <div className="title">{t.title}</div>
                  <div className="meta">
                    {t.description || "No description"}
                    {t.assignedTo ? ` • ${t.assignedTo.name}` : " • Unassigned"}
                    {t.dueDate ? ` • Due: ${new Date(t.dueDate).toLocaleDateString()}` : ""}
                    {isOverdue(t) && <span className="overdue-tag"> • OVERDUE</span>}
                  </div>
                </div>
                <span className={`status-pill ${pillClass(t.status)}`}>{t.status}</span>
                {canEditStatus && (
                  <select
                    value={t.status}
                    onChange={(e) => changeStatus(t._id, e.target.value)}
                    style={{ width: "auto" }}
                  >
                    {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                {user?.role === "Admin" && (
                  <>
                    <button className="btn btn-sm btn-secondary" style={{ marginTop: 0 }} onClick={() => startEdit(t)}>Edit</button>
                    <button className="btn btn-sm btn-danger" style={{ marginTop: 0 }} onClick={() => deleteTask(t._id)}>Delete</button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}