import { useEffect, useRef, useCallback } from 'react';

export interface HighlightStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface HighlightCanvasProps {
  isActive: boolean;
  color: string;
  strokeWidth: number;
  strokes: HighlightStroke[];
  onStrokesChange: (strokes: HighlightStroke[]) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const HIGHLIGHT_ALPHA = 0.4;

export default function HighlightCanvas({
  isActive,
  color,
  strokeWidth,
  strokes,
  onStrokesChange,
  canvasWidth,
  canvasHeight,
}: HighlightCanvasProps) {
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

  const renderStrokes = useCallback(
    (ctx: CanvasRenderingContext2D, strokeList: HighlightStroke[]) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const dpr = window.devicePixelRatio || 1;
      for (const stroke of strokeList) {
        if (stroke.points.length < 2) continue;
        ctx.save();
        ctx.globalAlpha = HIGHLIGHT_ALPHA;
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width * dpr;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    },
    []
  );

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
    ctx.globalAlpha = HIGHLIGHT_ALPHA;
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth * dpr;
    ctx.lineCap = 'square';
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
      onStrokesChange([...strokes, { points: pts, color, width: strokeWidth }]);
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
        cursor: isActive ? 'crosshair' : 'default',
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
