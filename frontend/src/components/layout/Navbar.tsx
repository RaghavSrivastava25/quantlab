"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { TrendingUp, LogOut, User, BarChart2, BookOpen, Trophy, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

const NAV = [
  { href: "/problems",     label: "Problems" },
  { href: "/strategy-lab", label: "Strategy Lab" },
  { href: "/research",     label: "Research" },
  { href: "/leaderboard",  label: "Leaderboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setOpen(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-dark-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <TrendingUp size={14} className="text-dark-900" strokeWidth={2.5} />
          </div>
          <span className="font-black text-slate-100 text-lg tracking-tight">QuantLab</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}
              className={clsx("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(href) ? "text-brand-400 bg-brand-500/10" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800")}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-slate-300 font-medium hidden sm:block">{user.username}</span>
                <ChevronDown size={13} className={clsx("text-slate-500 transition-transform", open && "rotate-180")} />
              </button>
              {open && (
                <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-3 py-2.5 border-b border-slate-800">
                    <div className="text-xs font-semibold text-slate-300">{user.username}</div>
                    <div className="text-xs text-slate-600">{user.email}</div>
                  </div>
                  <Link href="/profile" onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors w-full">
                    <User size={14} /> Profile
                  </Link>
                  <Link href="/dashboard" onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors w-full">
                    <BarChart2 size={14} /> Dashboard
                  </Link>
                  <button onClick={logout}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-slate-800 transition-colors w-full border-t border-slate-800">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors font-medium">
                Sign In
              </Link>
              <Link href="/auth/register" className="text-sm font-bold bg-brand-500 hover:bg-brand-400 text-dark-900 px-3.5 py-1.5 rounded-lg transition-colors">
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
