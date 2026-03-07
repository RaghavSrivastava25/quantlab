"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuth";
import { TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ email: "", username: "", password: "", full_name: "" });
  const [loading, setLoading] = useState(false);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async () => {
    if (!form.email || !form.username || !form.password) { toast.error("Fill in all required fields"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await register(form.email, form.username, form.password, form.full_name || undefined);
      toast.success("Account created!");
      router.push("/problems");
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "email", label: "Email *", type: "email", placeholder: "you@example.com" },
    { key: "username", label: "Username *", type: "text", placeholder: "quantwizard" },
    { key: "full_name", label: "Full Name", type: "text", placeholder: "Optional" },
    { key: "password", label: "Password *", type: "password", placeholder: "Min 8 characters" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <TrendingUp size={32} className="text-brand-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-100">Join QuantLab</h1>
          <p className="text-slate-400 text-sm mt-1">Free forever. No credit card required.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-slate-400 block mb-1.5">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={update(key)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder={placeholder}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors" />
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-dark-900 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-500 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
