import { useEffect, useRef, useCallback } from 'react';

export interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  isEraser?: boolean;
}

interface DrawingCanvasProps {
  isActive: boolean;
  color: string;
  strokeWidth: number;
  isEraser: boolean;
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export default function DrawingCanvas({
  isActive,
  color,
  strokeWidth,
  isEraser,
  strokes,
  onStrokesChange,
  canvasWidth,
  canvasHeight,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  const renderStrokes = useCallback((ctx: CanvasRenderingContext2D, strokeList: Stroke[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const dpr = window.devicePixelRatio || 1;
    for (const stroke of strokeList) {
      if (stroke.points.length < 2) continue;
      ctx.save();
      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }
      ctx.lineWidth = stroke.width * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    renderStrokes(ctx, strokes);
  }, [strokes, renderStrokes, canvasWidth, canvasHeight]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    e.preventDefault();
    isDrawingRef.current = true;
    currentStrokeRef.current = [getPos(e)];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || !isDrawingRef.current) return;
    e.preventDefault();
    currentStrokeRef.current.push(getPos(e));

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    renderStrokes(ctx, strokes);

    const pts = currentStrokeRef.current;
    if (pts.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }
    ctx.lineWidth = strokeWidth * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const handleMouseUp = () => {
    if (!isActive || !isDrawingRef.current) return;
    isDrawingRef.current = false;
    const pts = currentStrokeRef.current;
    if (pts.length >= 2) {
      onStrokesChange([...strokes, { points: pts, color, width: strokeWidth, isEraser }]);
    }
    currentStrokeRef.current = [];
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: isActive ? (isEraser ? 'cell' : 'crosshair') : 'default',
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
