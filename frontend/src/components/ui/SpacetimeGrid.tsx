"use client";
import { useEffect, useRef } from "react";

export default function SpacetimeGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLS = 28;
    const ROWS = 18;

    const getWarpedPoint = (col: number, row: number, W: number, H: number) => {
      const bx = (col / COLS) * W;
      const by = (row / ROWS) * H;
      const nx = col / COLS;
      const ny = row / ROWS;
      const warpX =
        Math.sin(ny * Math.PI * 2.5 + t * 0.9 + nx * 3.1) * 22 +
        Math.sin(ny * Math.PI * 1.2 + t * 0.5) * 10 +
        Math.cos(nx * Math.PI * 3 + t * 0.7) * 8;
      const warpY =
        Math.cos(nx * Math.PI * 2.5 + t * 1.1 + ny * 2.7) * 14 +
        Math.sin(nx * Math.PI * 1.5 + t * 0.6) * 7;
      return { x: bx + warpX, y: by + warpY };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.006;
      const W = canvas.width;
      const H = canvas.height;

      // Vertical lines
      for (let col = 0; col <= COLS; col++) {
        ctx.beginPath();
        let started = false;
        for (let row = 0; row <= ROWS; row++) {
          const { x, y } = getWarpedPoint(col, row, W, H);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
        const d = Math.abs(col / COLS - 0.5) * 2;
        const alpha = (0.055 + 0.09 * (1 - d)) * (0.7 + 0.3 * Math.sin(t * 1.5 + col * 0.4));
        ctx.strokeStyle = `rgba(34,197,94,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Horizontal lines
      for (let row = 0; row <= ROWS; row++) {
        ctx.beginPath();
        let started = false;
        for (let col = 0; col <= COLS; col++) {
          const { x, y } = getWarpedPoint(col, row, W, H);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
        const d = Math.abs(row / ROWS - 0.5) * 2;
        const alpha = (0.03 + 0.06 * (1 - d)) * (0.7 + 0.3 * Math.sin(t + row * 0.5));
        ctx.strokeStyle = `rgba(34,197,94,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Glowing intersection nodes
      for (let col = 0; col <= COLS; col += 3) {
        for (let row = 0; row <= ROWS; row += 3) {
          const { x, y } = getWarpedPoint(col, row, W, H);
          const pulse = 0.2 + 0.8 * Math.abs(Math.sin(t * 2.5 + col * 0.8 + row * 0.6));
          const radius = 1 + pulse * 1.5;
          const grd = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
          grd.addColorStop(0, `rgba(34,197,94,${0.5 * pulse})`);
          grd.addColorStop(1, "rgba(34,197,94,0)");
          ctx.beginPath();
          ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }
      }

      // Central glow
      const cx = W / 2 + Math.sin(t * 0.4) * W * 0.05;
      const cy = H / 2 + Math.cos(t * 0.3) * H * 0.05;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.55);
      grad.addColorStop(0, `rgba(34,197,94,${0.06 + 0.03 * Math.sin(t)})`);
      grad.addColorStop(0.4, `rgba(139,92,246,0.025)`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
