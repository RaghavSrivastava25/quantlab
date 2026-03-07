"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/hooks/useAuth";
import { TrendingUp, Code2, BookOpen, Trophy, LayoutDashboard, LogOut, LogIn } from "lucide-react";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/problems", label: "Problems", icon: Code2 },
  { href: "/strategy-lab", label: "Strategy Lab", icon: TrendingUp },
  { href: "/research", label: "Research", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, fetchMe, logout } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="h-16 bg-dark-900 border-b border-slate-800 flex items-center px-6 gap-8 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg text-brand-500 shrink-0">
        <TrendingUp size={22} />
        QuantLab
      </Link>

      <div className="flex items-center gap-1 flex-1">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              pathname.startsWith(href) ? "bg-brand-500/10 text-brand-500" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link href="/dashboard" className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors", pathname === "/dashboard" ? "bg-brand-500/10 text-brand-500" : "text-slate-400 hover:text-slate-100")}>
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
            <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-dark-900">
                {user.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-slate-300">{user.username}</span>
              <span className="text-xs text-brand-500 font-mono font-bold">{user.total_points}pts</span>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <Link href="/auth/login" className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-500 text-dark-900 rounded-md text-sm font-semibold hover:bg-brand-600 transition-colors">
            <LogIn size={15} />
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
