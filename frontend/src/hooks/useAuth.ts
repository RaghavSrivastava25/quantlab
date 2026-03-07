import { create } from "zustand";
import api from "@/lib/api";

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  total_points: number;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, full_name?: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("ql_token") : null,
  loading: false,

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const token = res.data.access_token;
    localStorage.setItem("ql_token", token);
    set({ token });
    const me = await api.get("/auth/me");
    set({ user: me.data });
  },

  register: async (email, username, password, full_name) => {
    const res = await api.post("/auth/register", { email, username, password, full_name });
    const token = res.data.access_token;
    localStorage.setItem("ql_token", token);
    set({ token });
    const me = await api.get("/auth/me");
    set({ user: me.data });
  },

  logout: () => {
    localStorage.removeItem("ql_token");
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const token = localStorage.getItem("ql_token");
      if (!token) return;
      const me = await api.get("/auth/me");
      set({ user: me.data, token });
    } catch {
      set({ user: null, token: null });
    }
  },
}));
