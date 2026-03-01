"use client";

import { useState } from "react";
import { Check, Edit3, RotateCcw, ChevronDown, ChevronUp, FileText } from "lucide-react";

interface Citation {
  doc: string;
  snippet: string;
}

interface Evidence {
  doc: string;
  text: string;
}

interface QAPairData {
  id: number;
  question_number: number;
  original_question: string;
  ai_answer: string;
  citations: Citation[];
  evidence_snippets: Evidence[];
  status: string;
  is_edited: boolean;
}

interface QACardProps {
  qa: QAPairData;
  onSaveEdit: (qaId: number, newAnswer: string) => Promise<void>;
  onRegenerate?: (qaId: number) => Promise<void>;
}

export default function QACard({ qa, onSaveEdit, onRegenerate }: QACardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(qa.ai_answer || "");
  const [showEvidence, setShowEvidence] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSaveEdit(qa.id, editedAnswer);
    setIsEditing(false);
    setSaving(false);
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setRegenerating(true);
    await onRegenerate(qa.id);
    setRegenerating(false);
  };

  const statusBadgeClass =
    qa.status === "answered"
      ? "badge badge-answered"
      : qa.status === "not_found"
      ? "badge badge-not-found"
      : "badge badge-pending";

  return (
    <div className="glass-card fade-in" style={{ padding: "24px", marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--color-accent), #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {qa.question_number}
          </div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              lineHeight: 1.4,
            }}
          >
            {qa.original_question}
          </h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {qa.is_edited && (
            <span
              style={{
                fontSize: 11,
                color: "var(--color-warning)",
                fontStyle: "italic",
              }}
            >
              edited
            </span>
          )}
          <span className={statusBadgeClass}>
            {qa.status === "answered" ? "✓ Answered" : qa.status === "not_found" ? "✗ Not Found" : "⏳ Pending"}
          </span>
        </div>
      </div>
      <div
        style={{
          padding: "16px",
          background: "var(--color-bg-input)",
          borderRadius: 12,
          border: "1px solid var(--color-border)",
          marginBottom: 12,
        }}
      >
        {isEditing ? (
          <div>
            <textarea
              value={editedAnswer}
              onChange={(e) => setEditedAnswer(e.target.value)}
              style={{
                width: "100%",
                minHeight: 100,
                padding: 12,
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-accent)",
                borderRadius: 8,
                color: "var(--color-text-primary)",
                fontSize: 14,
                lineHeight: 1.6,
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn-glow" onClick={handleSave} disabled={saving} style={{ padding: "8px 20px", fontSize: 13 }}>
                {saving ? <span className="spinner" /> : <><Check size={14} /> Save</>}
              </button>
              <button className="btn-secondary" onClick={() => { setIsEditing(false); setEditedAnswer(qa.ai_answer || ""); }} style={{ padding: "8px 20px", fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-text-primary)" }}>
            {qa.ai_answer || "No answer yet."}
          </p>
        )}
      </div>
      {qa.citations && qa.citations.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6, display: "block" }}>
            Citations
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {qa.citations.map((citation, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  background: "rgba(108, 92, 231, 0.1)",
                  border: "1px solid rgba(108, 92, 231, 0.25)",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "var(--color-accent)",
                  fontWeight: 500,
                }}
              >
                <FileText size={11} />
                {typeof citation === "string" ? citation : citation.doc}
              </span>
            ))}
          </div>
        </div>
      )}
      {qa.evidence_snippets && qa.evidence_snippets.length > 0 && (
        <div>
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              padding: "4px 0",
            }}
          >
            {showEvidence ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Evidence Snippets ({qa.evidence_snippets.length})
          </button>
          {showEvidence && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              {qa.evidence_snippets.map((ev, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    background: "rgba(108, 92, 231, 0.05)",
                    borderLeft: "3px solid var(--color-accent)",
                    borderRadius: "0 8px 8px 0",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--color-accent)",
                      marginBottom: 4,
                    }}
                  >
                    📄 {typeof ev === "string" ? "Document" : ev.doc}
                  </span>
                  <span style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                    &ldquo;{typeof ev === "string" ? ev : ev.text}&rdquo;
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {!isEditing && (
          <button
            className="btn-secondary"
            onClick={() => setIsEditing(true)}
            style={{ padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
          >
            <Edit3 size={12} /> Edit
          </button>
        )}
        {onRegenerate && (
          <button
            className="btn-secondary"
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{ padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
          >
            {regenerating ? <span className="spinner" /> : <><RotateCcw size={12} /> Regenerate</>}
          </button>
        )}
      </div>
    </div>
  );
}
