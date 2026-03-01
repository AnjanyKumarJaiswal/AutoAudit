import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes("/api/auth");
    if (error.response?.status === 401 && typeof window !== "undefined" && !isAuthEndpoint) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/?auth=login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (email: string, password: string) =>
    api.post("/api/auth/signup", { email, password }),
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  googleLogin: (credential: string) =>
    api.post("/api/auth/google", { credential }),
  me: () => api.get("/api/auth/me"),
};

export const projectsAPI = {
  list: () => api.get("/api/projects"),
  create: (name: string) => api.post("/api/projects", { name }),
  get: (id: number) => api.get(`/api/projects/${id}`),
  delete: (id: number) => api.delete(`/api/projects/${id}`),
};

export const documentsAPI = {
  upload: (projectId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api.post(`/api/projects/${projectId}/references`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  list: (projectId: number) => api.get(`/api/projects/${projectId}/references`),
  delete: (projectId: number, docId: number) =>
    api.delete(`/api/projects/${projectId}/references/${docId}`),
};

export const questionnaireAPI = {
  upload: (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/api/projects/${projectId}/questionnaire`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  get: (projectId: number) => api.get(`/api/projects/${projectId}/questionnaire`),
};

export const answersAPI = {
  generate: (projectId: number) =>
    api.post(`/api/projects/${projectId}/generate`),
  list: (projectId: number, versionId?: number) =>
    api.get(`/api/projects/${projectId}/answers`, {
      params: versionId ? { version_id: versionId } : {},
    }),
  update: (projectId: number, qaId: number, data: { ai_answer?: string; status?: string }) =>
    api.put(`/api/projects/${projectId}/answers/${qaId}`, data),
  regenerate: (projectId: number, qaId: number) =>
    api.post(`/api/projects/${projectId}/regenerate/${qaId}`),
};

export const exportAPI = {
  download: (projectId: number, versionId?: number) =>
    api.get(`/api/projects/${projectId}/export`, {
      params: versionId ? { version_id: versionId } : {},
      responseType: "blob",
    }),
};

export const versionsAPI = {
  list: (projectId: number) => api.get(`/api/projects/${projectId}/versions`),
  get: (projectId: number, versionId: number) =>
    api.get(`/api/projects/${projectId}/versions/${versionId}`),
};

export default api;
