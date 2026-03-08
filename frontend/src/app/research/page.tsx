"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function ResearchPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/problems"); }, []);
  return null;
}
