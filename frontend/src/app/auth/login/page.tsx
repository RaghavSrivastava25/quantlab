"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuth";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { toast.error("Fill in all fields"); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <TrendingUp size={32} className="text-brand-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-100">Sign in to QuantLab</h1>
          <p className="text-slate-400 text-sm mt-1">Continue your quant journey</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="you@example.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-dark-900 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          No account?{" "}
          <Link href="/auth/register" className="text-brand-500 hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
