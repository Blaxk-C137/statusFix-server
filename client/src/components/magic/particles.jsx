import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (event) =>
      setMousePosition({ x: event.clientX, y: event.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return mousePosition;
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const int = parseInt(hex, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/**
 * Magic UI — Particles
 * Interactive canvas particle field: drifting dots that fade near the mouse.
 */
export function Particles({
  className,
  quantity = 120,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#25D366",
  vx = 0,
  vy = 0,
  ...props
}) {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const context = useRef(null);
  const circles = useRef([]);
  const mousePosition = useMousePosition();
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const rafID = useRef(null);

  useEffect(() => {
    if (canvasRef.current) context.current = canvasRef.current.getContext("2d");
    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);
    return () => {
      if (rafID.current != null) window.cancelAnimationFrame(rafID.current);
      window.removeEventListener("resize", initCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  useEffect(() => { onMouseMove(); }, [mousePosition.x, mousePosition.y]);

  useEffect(() => { initCanvas(); }, [refresh]);

  const initCanvas = () => { resizeCanvas(); drawParticles(); };

  const onMouseMove = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = mousePosition.x - rect.left - w / 2;
      const y = mousePosition.y - rect.top - h / 2;
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
      if (inside) { mouse.current.x = x; mouse.current.y = y; }
    }
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
      circles.current = [];
      for (let i = 0; i < quantity; i++) circleParams();
    }
  };

  const circleParams = () => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const pSize = Math.floor(Math.random() * 2) + size;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.1;
    const dy = (Math.random() - 0.5) * 0.1;
    const magnetism = 0.1 + Math.random() * 4;
    circles.current.push({ x, y, translateX: 0, translateY: 0, size: pSize, alpha, targetAlpha, dx, dy, magnetism });
  };

  const rgb = hexToRgb(color);

  const drawCircle = (circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!update) circles.current.push(circle);
    }
  };

  const clearContext = () => {
    if (context.current) {
      context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
    }
  };

  const drawParticles = () => {
    clearContext();
    for (let i = 0; i < quantity; i++) drawCircle(circleParams());
  };

  const remapValue = (value, start1, end1, start2, end2) => {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  const animate = () => {
    clearContext();
    circles.current.forEach((circle, i) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));
      if (remapClosestEdge > 1) circle.alpha += 0.02;
      else circle.alpha = circle.targetAlpha * remapClosestEdge;
      if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;
      circle.translateX += (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease;
      circle.translateY += (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease;
      drawCircle(circle, true);
      if (
        circle.x < -circle.size || circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size || circle.y > canvasSize.current.h + circle.size
      ) {
        circles.current.splice(i, 1);
        drawCircle(circleParams());
      }
    });
    rafID.current = window.requestAnimationFrame(animate);
  };

  return (
    <div ref={canvasContainerRef} aria-hidden="true" className={cn("pointer-events-none", className)} {...props}>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}

export default Particles;
