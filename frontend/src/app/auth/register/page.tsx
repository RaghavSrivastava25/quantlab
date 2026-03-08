"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (form.username.length < 3) { setError("Username must be at least 3 characters"); return; }
    setLoading(true);
    try {
      await register(form.email, form.username, form.password);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.detail || "Registration failed — username or email may already exist");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-100 mb-2">Create your account</h1>
          <p className="text-slate-400">Free forever. No credit card needed.</p>
        </div>
        <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Username <span className="text-slate-600">(shown on leaderboard)</span></label>
            <input type="text" required value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="quantmaster42" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Password <span className="text-slate-600">(min 8 chars)</span></label>
            <input type="password" required value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Confirm Password</label>
            <input type="password" required value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-dark-900 font-bold py-3 rounded-xl transition-all">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
