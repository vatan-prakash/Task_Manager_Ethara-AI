"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Navbar";
import { api, getUser } from "../../lib/api";

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // loading state - khaali na lage

  // create form
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  // EDIT project state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", members: [] });

  const load = async () => {
    try {
      const p = await api.getProjects();
      setProjects(p);
      const u = getUser();
      if (u?.role === "Admin") {
        const users = await api.users();
        setAllUsers(users.filter((x) => x.role === "Member"));
      }
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

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const createProject = async () => {
    setError("");
    try {
      await api.createProject({ name, description: desc, members: selectedMembers });
      setName(""); setDesc(""); setSelectedMembers([]);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    const backup = projects;
    setProjects((prev) => prev.filter((p) => p._id !== id)); // optimistic: turant hatao
    try {
      await api.deleteProject(id);
    } catch (err) {
      setError(err.message);
      setProjects(backup);
    }
  };

  // EDIT
  const startEdit = (p) => {
    setEditingId(p._id);
    setEditForm({
      name: p.name || "",
      description: p.description || "",
      members: (p.members || []).map((m) => m._id), // sirf IDs
    });
  };

  const cancelEdit = () => setEditingId(null);

  const toggleEditMember = (id) => {
    setEditForm((prev) => ({
      ...prev,
      members: prev.members.includes(id)
        ? prev.members.filter((m) => m !== id)
        : [...prev.members, id],
    }));
  };

  // EDIT save - name, description, members update
  const saveEdit = async (projectId) => {
    setError("");
    try {
      const updated = await api.updateProject(projectId, {
        name: editForm.name,
        description: editForm.description,
        members: editForm.members,
      });
    
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 style={{ color: "#fff" }}>Projects</h2>
        {error && <p className="error">{error}</p>}

        {/* Admin: create project */}
        {user?.role === "Admin" && (
          <div className="card" style={{ marginTop: 16 }}>
            <h3 className="section-title" style={{ marginTop: 0 }}>Create New Project</h3>
            <div className="grid-2">
              <div>
                <label>Project Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Website Redesign" />
              </div>
              <div>
                <label>Description</label>
                <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional" />
              </div>
            </div>

            <label>Add Members</label>
            {allUsers.length === 0 ? (
              <p className="meta" style={{ color: "var(--muted)", fontSize: 13 }}>
                No member accounts yet. Ask teammates to sign up as "Member".
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                {allUsers.map((m) => (
                  <button
                    key={m._id}
                    className={`btn btn-sm ${selectedMembers.includes(m._id) ? "" : "btn-secondary"}`}
                    onClick={() => toggleMember(m._id)}
                  >
                    {selectedMembers.includes(m._id) ? "✓ " : "+ "}{m.name}
                  </button>
                ))}
              </div>
            )}

            <button className="btn" onClick={createProject}>Create Project</button>
          </div>
        )}

        <h3 className="section-title">{user?.role === "Admin" ? "Your Projects" : "Projects you're in"}</h3>

        {loading ? (
          <div className="card empty">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="card empty">No projects yet.</div>
        ) : (
          projects.map((p) => {
           
            if (editingId === p._id && user?.role === "Admin") {
              return (
                <div className="card" key={p._id} style={{ marginBottom: 10 }}>
                  <h4 style={{ color: "#fff", marginBottom: 8 }}>✏️ Edit Project</h4>
                  <div className="grid-2">
                    <div>
                      <label>Project Name</label>
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Description</label>
                      <input
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <label>Members</label>
                  {allUsers.length === 0 ? (
                    <p className="meta" style={{ color: "var(--muted)", fontSize: 13 }}>No member accounts yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                      {allUsers.map((m) => (
                        <button
                          key={m._id}
                          className={`btn btn-sm ${editForm.members.includes(m._id) ? "" : "btn-secondary"}`}
                          onClick={() => toggleEditMember(m._id)}
                        >
                          {editForm.members.includes(m._id) ? "✓ " : "+ "}{m.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn btn-sm" style={{ marginTop: 0 }} onClick={() => saveEdit(p._id)}>Save</button>
                    <button className="btn btn-sm btn-secondary" style={{ marginTop: 0 }} onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              );
            }

            // normal project row
            return (
              <div className="row" key={p._id}>
                <div className="info">
                  <div className="title">{p.name}</div>
                  <div className="meta">
                    {p.description || "No description"} • {p.members?.length || 0} member(s)
                    {p.owner?.name ? ` • Owner: ${p.owner.name}` : ""}
                  </div>
                </div>
                <a className="btn btn-sm btn-secondary" style={{ marginTop: 0 }} href={`/projects/${p._id}`}>Open</a>
                {user?.role === "Admin" && (
                  <>
                    <button className="btn btn-sm btn-secondary" style={{ marginTop: 0 }} onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-danger" style={{ marginTop: 0 }} onClick={() => deleteProject(p._id)}>Delete</button>
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