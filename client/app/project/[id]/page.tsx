"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import Navbar from "../../components/Navbar";
import FileUpload from "../../components/FileUpload";
import {
  projectsAPI,
  documentsAPI,
  questionnaireAPI,
  answersAPI,
} from "@/lib/api";
import {
  ArrowLeft,
  Upload,
  Zap,
  FileText,
  Trash2,
  ChevronRight,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface RefDoc {
  id: number;
  filename: string;
  uploaded_at: string;
  text_length: number;
}

interface ProjectData {
  id: number;
  name: string;
  status: string;
  reference_docs: RefDoc[];
  questionnaires: any[];
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const projectId = Number(params.id);

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refFiles, setRefFiles] = useState<File[]>([]);
  const [questFile, setQuestFile] = useState<File[]>([]);
  const [uploadingRefs, setUploadingRefs] = useState(false);
  const [uploadingQuest, setUploadingQuest] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && projectId) fetchProject();
  }, [user, projectId]);

  const fetchProject = async () => {
    try {
      const res = await projectsAPI.get(projectId);
      setProject(res.data.project);

      // Also check if questionnaire exists
      try {
        const qRes = await questionnaireAPI.get(projectId);
        setQuestionnaire(qRes.data.questionnaire);
      } catch {
        setQuestionnaire(null);
      }
    } catch {
      toast.error("Failed to load project");
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const handleUploadRefs = async () => {
    if (refFiles.length === 0) return;
    setUploadingRefs(true);
    try {
      await documentsAPI.upload(projectId, refFiles);
      toast.success(`Uploaded ${refFiles.length} reference document(s)`);
      setRefFiles([]);
      fetchProject();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed");
    }
    setUploadingRefs(false);
  };

  const handleUploadQuestionnaire = async () => {
    if (questFile.length === 0) return;
    setUploadingQuest(true);
    try {
      const res = await questionnaireAPI.upload(projectId, questFile[0]);
      toast.success(`Uploaded questionnaire with ${res.data.questions.length} questions`);
      setQuestFile([]);
      fetchProject();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed");
    }
    setUploadingQuest(false);
  };

  const handleDeleteRef = async (docId: number) => {
    try {
      await documentsAPI.delete(projectId, docId);
      toast.success("Document removed");
      fetchProject();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await answersAPI.generate(projectId);
      toast.success(`Generated answers for ${res.data.results.length} questions!`);
      router.push(`/project/${projectId}/review`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Generation failed");
    }
    setGenerating(false);
  };

  const canGenerate =
    project &&
    project.reference_docs.length > 0 &&
    project.questionnaires.length > 0 &&
    project.status !== "processing";

  if (authLoading || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!project) return null;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "96px 24px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 14 }}>
          <Link href="/dashboard" style={{ color: "var(--color-text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <ChevronRight size={14} style={{ color: "var(--color-text-muted)" }} />
          <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{project.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{project.name}</h1>
            <span className={`badge badge-${project.status}`}>{project.status}</span>
          </div>
          {(project.status === "review" || project.status === "completed") && (
            <button className="btn-glow" onClick={() => router.push(`/project/${projectId}/review`)}>
              View Answers <ChevronRight size={16} />
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={18} style={{ color: "var(--color-accent)" }} />
              Reference Documents
            </h2>
            {project.reference_docs.length > 0 && (
              <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {project.reference_docs.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "var(--color-bg-input)",
                      borderRadius: 10,
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <FileText size={14} style={{ color: "var(--color-success)" }} />
                      <span style={{ fontSize: 13 }}>{doc.filename}</span>
                      <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                        ({(doc.text_length / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteRef(doc.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 4 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <FileUpload
              label=""
              description="PDF, DOCX, or TXT files"
              multiple
              selectedFiles={refFiles}
              onFilesSelected={(files) => setRefFiles((prev) => [...prev, ...files])}
              onRemoveFile={(i) => setRefFiles((prev) => prev.filter((_, idx) => idx !== i))}
              accept={{
                "application/pdf": [".pdf"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                "text/plain": [".txt"],
              }}
            />

            {refFiles.length > 0 && (
              <button
                className="btn-glow"
                onClick={handleUploadRefs}
                disabled={uploadingRefs}
                style={{ marginTop: 12, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {uploadingRefs ? <span className="spinner" /> : <><Upload size={14} /> Upload {refFiles.length} file(s)</>}
              </button>
            )}
          </div>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={18} style={{ color: "var(--color-warning)" }} />
              Questionnaire
            </h2>

            {questionnaire && (
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--color-bg-input)",
                  borderRadius: 10,
                  border: "1px solid var(--color-border)",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={14} style={{ color: "var(--color-success)" }} />
                  <span style={{ fontSize: 13 }}>{questionnaire.filename}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", marginLeft: 22 }}>
                  {questionnaire.question_count} questions parsed
                </span>
              </div>
            )}

            <FileUpload
              label=""
              description="CSV, XLSX, PDF, DOCX, or TXT"
              selectedFiles={questFile}
              onFilesSelected={(files) => setQuestFile(files)}
              onRemoveFile={() => setQuestFile([])}
              accept={{
                "text/csv": [".csv"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                "application/pdf": [".pdf"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                "text/plain": [".txt"],
              }}
            />

            {questFile.length > 0 && (
              <button
                className="btn-glow"
                onClick={handleUploadQuestionnaire}
                disabled={uploadingQuest}
                style={{ marginTop: 12, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {uploadingQuest ? <span className="spinner" /> : <><Upload size={14} /> Upload Questionnaire</>}
              </button>
            )}
          </div>
        </div>
        <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
          {generating ? (
            <div className="fade-in">
              <div className="pulse-glow" style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--color-bg-card)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Loader size={28} style={{ color: "var(--color-accent)", animation: "spin 2s linear infinite" }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>AI Agent is working...</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
                Analyzing your reference documents and generating answers. This may take a minute.
              </p>
            </div>
          ) : (
            <>
              <Zap size={32} style={{ color: "var(--color-accent)", marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Generate AI Answers</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 20, maxWidth: 500, margin: "0 auto 20px" }}>
                {canGenerate
                  ? "Upload reference docs and a questionnaire, then click generate to let the AI agent answer each question."
                  : "Please upload at least one reference document and a questionnaire to proceed."}
              </p>
              <button
                className="btn-glow"
                onClick={handleGenerate}
                disabled={!canGenerate}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 36px", fontSize: 16 }}
              >
                <Zap size={18} /> Generate Answers
              </button>
            </>
          )}
        </div>
      </main>
    </>
  );
}
