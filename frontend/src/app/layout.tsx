import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "QuantLab — LeetCode for Quant Finance",
  description: "Learn quant finance by solving interactive coding challenges and building trading strategies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-950 text-slate-100">
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" },
          }}
        />
      </body>
    </html>
  );
}
