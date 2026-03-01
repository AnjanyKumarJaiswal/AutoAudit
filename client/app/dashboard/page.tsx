"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import Navbar from "../components/Navbar";
import { projectsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Plus, FolderOpen, Clock, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: number;
  name: string;
  status: string;
  created_at: string;
  reference_doc_count: number;
  questionnaire_count: number;
  version_count: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectsAPI.list();
        setProjects(res.data.projects);
      } catch {
        toast.error("Failed to load projects");
      }
      setLoading(false);
    };

    if (user) fetchProjects();
  }, [user]);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await projectsAPI.create(newName.trim());
      toast.success("Project created!");
      router.push(`/project/${res.data.project.id}`);
    } catch {
      toast.error("Failed to create project");
    }
    setCreating(false);
  };

  const deleteProject = async (id: number) => {
    if (!window.confirm("Delete this project and all its data?")) return;
    try {
      await projectsAPI.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const getStatusBadge = (status: string) => {
    const classMap: Record<string, string> = {
      pending: "badge badge-pending",
      processing: "badge badge-processing",
      review: "badge badge-review",
      completed: "badge badge-completed",
    };
    return classMap[status] || "badge badge-pending";
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "48px 24px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Your Audits</h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
              Manage your questionnaire audits and reviews
            </p>
          </div>
          <button
            className="btn-glow"
            onClick={() => setShowNewForm(true)}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={18} /> New Audit
          </button>
        </div>
        {showNewForm && (
          <div className="glass-card fade-in" style={{ padding: 24, marginBottom: 24 }}>
            <form onSubmit={createProject} style={{ display: "flex", gap: 12 }}>
              <input
                className="input-field"
                placeholder="Enter audit name (e.g., Vendor Security Assessment Q1)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-glow" disabled={creating} style={{ whiteSpace: "nowrap" }}>
                {creating ? <span className="spinner" /> : "Create"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setShowNewForm(false); setNewName(""); }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
        {projects.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <FolderOpen size={48} style={{ color: "var(--color-text-muted)", marginBottom: 16 }} />
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No audits yet</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 24 }}>
              Create your first audit to get started with AI-powered questionnaire answering.
            </p>
            <button
              className="btn-glow"
              onClick={() => setShowNewForm(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Plus size={18} /> Create Your First Audit
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {projects.map((project) => (
              <div
                key={project.id}
                className="glass-card fade-in"
                style={{ padding: 24, cursor: "pointer", position: "relative" }}
                onClick={() => router.push(`/project/${project.id}`)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, flex: 1, marginRight: 8 }}>{project.name}</h3>
                  <span className={getStatusBadge(project.status)}>{project.status}</span>
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 13, color: "var(--color-text-secondary)" }}>
                  <span>{project.reference_doc_count} ref docs</span>
                  <span>{project.questionnaire_count} questionnaire</span>
                  <span>{project.version_count} versions</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)" }}>
                    <Clock size={12} />
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn-secondary"
                      onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                      style={{ padding: "4px 10px", fontSize: 12 }}
                    >
                      <Trash2 size={12} />
                    </button>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--color-accent)", fontWeight: 600 }}>
                      Open <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
