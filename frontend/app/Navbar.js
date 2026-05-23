"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, logout } from "../lib/api";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="nav">
      <div className="nav-brand">📋 Task Manager</div>
      <div className="nav-links">
        <a href="/dashboard">Dashboard</a>
        <a href="/projects">Projects</a>
        {user && (
          <>
            <span style={{ fontSize: 13 }}>
              {user.name}{" "}
              <span className={`badge ${user.role === "Admin" ? "tag-admin" : ""}`}>
                {user.role}
              </span>
            </span>
            <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
