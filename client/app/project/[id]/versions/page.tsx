"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";
import Navbar from "../../../components/Navbar";
import { versionsAPI, projectsAPI } from "@/lib/api";
import { ArrowLeft, ChevronRight, Clock, FileText, Eye } from "lucide-react";
import Link from "next/link";

interface Version {
  id: number;
  version_num: number;
  label: string;
  created_at: string;
  qa_count: number;
}

export default function VersionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const projectId = Number(params.id);

  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && projectId) {
      fetchVersions();
      fetchProject();
    }
  }, [user, projectId]);

  const fetchProject = async () => {
    try {
      const res = await projectsAPI.get(projectId);
      setProjectName(res.data.project.name);
    } catch {}
  };

  const fetchVersions = async () => {
    try {
      const res = await versionsAPI.list(projectId);
      setVersions(res.data.versions);
    } catch {}
    setLoading(false);
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
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 14 }}>
          <Link href="/dashboard" style={{ color: "var(--color-text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <ChevronRight size={14} style={{ color: "var(--color-text-muted)" }} />
          <Link href={`/project/${projectId}`} style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>
            {projectName || "Project"}
          </Link>
          <ChevronRight size={14} style={{ color: "var(--color-text-muted)" }} />
          <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>Version History</span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>Version History</h1>

        {versions.length === 0 ? (
          <div className="glass-card" style={{ padding: "60px 40px", textAlign: "center" }}>
            <Clock size={48} style={{ color: "var(--color-text-muted)", marginBottom: 16 }} />
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No versions yet</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
              Versions are created each time you generate answers.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="glass-card fade-in"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  animationDelay: `${index * 0.05}s`,
                }}
                onClick={() => router.push(`/project/${projectId}/review?version=${version.id}`)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: index === 0
                        ? "linear-gradient(135deg, var(--color-accent), #a855f7)"
                        : "var(--color-bg-input)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      color: index === 0 ? "white" : "var(--color-text-secondary)",
                      border: index === 0 ? "none" : "1px solid var(--color-border)",
                    }}
                  >
                    v{version.version_num}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                      {version.label}
                      {index === 0 && (
                        <span style={{ marginLeft: 8, fontSize: 11, color: "var(--color-accent)", fontWeight: 700 }}>
                          LATEST
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={11} />
                        {new Date(version.created_at).toLocaleString()}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <FileText size={11} />
                        {version.qa_count} answers
                      </span>
                    </div>
                  </div>
                </div>
                <Eye size={18} style={{ color: "var(--color-text-muted)" }} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
