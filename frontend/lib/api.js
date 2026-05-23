const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// token localStorage se laao
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// generic request helper
async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.message ||
      (data.errors && data.errors[0]?.msg) ||
      "Something went wrong";
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // auth
  signup: (body) => request("/auth/signup", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  me: () => request("/auth/me"),
  users: () => request("/auth/users"),

  // projects
  getProjects: () => request("/projects"),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (body) => request("/projects", { method: "POST", body }),
  updateProject: (id, body) => request(`/projects/${id}`, { method: "PUT", body }),
  deleteProject: (id) => request(`/projects/${id}`, { method: "DELETE" }),

  // tasks
  getTasks: () => request("/tasks"),
  getTasksByProject: (pid) => request(`/tasks/project/${pid}`),
  createTask: (body) => request("/tasks", { method: "POST", body }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: "PUT", body }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  dashboard: () => request("/tasks/dashboard"),
};

// auth helpers
export function saveAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}
export function getUser() {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
