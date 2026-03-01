"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile?: (index: number) => void;
  multiple?: boolean;
  accept?: Record<string, string[]>;
  label: string;
  description: string;
}

export default function FileUpload({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  multiple = false,
  accept,
  label,
  description,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept,
  });

  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginBottom: 8,
        }}
      >
        {label}
      </label>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "dropzone-active" : ""}`}
      >
        <input {...getInputProps()} />
        <Upload
          size={32}
          style={{
            color: isDragActive
              ? "var(--color-accent)"
              : "var(--color-text-muted)",
            marginBottom: 12,
          }}
        />
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: 14,
            marginBottom: 4,
          }}
        >
          {isDragActive
            ? "Drop files here..."
            : "Drag & drop or click to upload"}
        </p>
        <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
          {description}
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {selectedFiles.map((file, index) => (
            <div
              key={index}
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
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={16} style={{ color: "var(--color-accent)" }} />
                <span
                  style={{ fontSize: 13, color: "var(--color-text-primary)" }}
                >
                  {file.name}
                </span>
                <span
                  style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                >
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              {onRemoveFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(index);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-muted)",
                    padding: 4,
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
