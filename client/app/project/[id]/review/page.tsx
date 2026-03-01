"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";
import Navbar from "../../../components/Navbar";
import QACard from "../../../components/QACard";
import { answersAPI, exportAPI, versionsAPI, projectsAPI } from "@/lib/api";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Coverage {
  total: number;
  answered: number;
  not_found: number;
  pending: number;
}

interface QAPairData {
  id: number;
  question_number: number;
  original_question: string;
  ai_answer: string;
  citations: any[];
  evidence_snippets: any[];
  status: string;
  is_edited: boolean;
}

interface Version {
  id: number;
  version_num: number;
  label: string;
  created_at: string;
  qa_count: number;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const projectId = Number(params.id);

  const [qaPairs, setQaPairs] = useState<QAPairData[]>([]);
  const [coverage, setCoverage] = useState<Coverage>({ total: 0, answered: 0, not_found: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | undefined>();
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && projectId) {
      fetchAnswers();
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

  const fetchAnswers = async (versionId?: number) => {
    try {
      const res = await answersAPI.list(projectId, versionId);
      setQaPairs(res.data.qa_pairs);
      setCoverage(res.data.coverage);
    } catch {
      toast.error("Failed to load answers");
    }
    setLoading(false);
  };

  const fetchVersions = async () => {
    try {
      const res = await versionsAPI.list(projectId);
      setVersions(res.data.versions);
    } catch {}
  };

  const handleSaveEdit = async (qaId: number, newAnswer: string) => {
    try {
      const res = await answersAPI.update(projectId, qaId, { ai_answer: newAnswer });
      setQaPairs((prev) =>
        prev.map((qa) => (qa.id === qaId ? { ...qa, ...res.data.qa_pair } : qa))
      );
      toast.success("Answer updated");
    } catch {
      toast.error("Failed to save edit");
    }
  };

  const handleRegenerate = async (qaId: number) => {
    try {
      const res = await answersAPI.regenerate(projectId, qaId);
      if (res.data.result) {
        fetchAnswers(selectedVersion);
        toast.success("Answer regenerated");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Regeneration failed");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportAPI.download(projectId, selectedVersion);
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, "_")}_Audit_Report.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded!");
    } catch {
      toast.error("Export failed");
    }
    setExporting(false);
  };

  const handleVersionSelect = (versionId: number) => {
    setSelectedVersion(versionId);
    setLoading(true);
    fetchAnswers(versionId);
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
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "96px 24px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 14 }}>
          <Link href="/dashboard" style={{ color: "var(--color-text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <ChevronRight size={14} style={{ color: "var(--color-text-muted)" }} />
          <Link href={`/project/${projectId}`} style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>
            {projectName || "Project"}
          </Link>
          <ChevronRight size={14} style={{ color: "var(--color-text-muted)" }} />
          <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>Review</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Review Answers</h1>
          <div style={{ display: "flex", gap: 12 }}>
            {versions.length > 0 && (
              <select
                value={selectedVersion || ""}
                onChange={(e) => handleVersionSelect(Number(e.target.value))}
                style={{
                  padding: "8px 14px",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  color: "var(--color-text-primary)",
                  fontSize: 13,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="">Latest</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label} ({new Date(v.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}

            <Link href={`/project/${projectId}/versions`}>
              <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <History size={14} /> Versions
              </button>
            </Link>

            <button
              className="btn-glow"
              onClick={handleExport}
              disabled={exporting}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              {exporting ? <span className="spinner" /> : <><Download size={16} /> Export DOCX</>}
            </button>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={16} style={{ color: "var(--color-text-muted)" }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Total: {coverage.total}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle size={16} style={{ color: "var(--color-success)" }} />
              <span style={{ fontSize: 14, color: "var(--color-success)" }}>Answered: {coverage.answered}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <XCircle size={16} style={{ color: "var(--color-danger)" }} />
              <span style={{ fontSize: 14, color: "var(--color-danger)" }}>Not Found: {coverage.not_found}</span>
            </div>
            {coverage.pending > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={16} style={{ color: "var(--color-warning)" }} />
                <span style={{ fontSize: 14, color: "var(--color-warning)" }}>Pending: {coverage.pending}</span>
              </div>
            )}
          </div>
          <div style={{ width: 200, height: 8, background: "var(--color-bg-input)", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${coverage.total > 0 ? ((coverage.answered / coverage.total) * 100) : 0}%`,
                background: "linear-gradient(90deg, var(--color-success), var(--color-accent))",
                borderRadius: 4,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
        {qaPairs.length === 0 ? (
          <div className="glass-card" style={{ padding: "60px 40px", textAlign: "center" }}>
            <AlertCircle size={48} style={{ color: "var(--color-text-muted)", marginBottom: 16 }} />
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No answers yet</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
              Go back to the project page and generate answers first.
            </p>
          </div>
        ) : (
          qaPairs.map((qa) => (
            <QACard
              key={qa.id}
              qa={qa}
              onSaveEdit={handleSaveEdit}
              onRegenerate={handleRegenerate}
            />
          ))
        )}
      </main>
    </>
  );
}
