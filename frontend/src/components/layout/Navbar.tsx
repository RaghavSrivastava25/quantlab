"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/problems",  label: "Problems" },
  { href: "/research",  label: "Research" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-dark-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <TrendingUp size={14} className="text-dark-900" strokeWidth={2.5} />
          </div>
          <span className="font-black text-slate-100 text-lg tracking-tight">QuantLab</span>
        </Link>
        <div className="flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}
              className={clsx("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "text-brand-400 bg-brand-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800")}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
