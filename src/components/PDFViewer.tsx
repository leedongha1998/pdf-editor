import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFViewerProps {
  data: ArrayBuffer;
  pageNumber: number;
  zoom: number;
}

export default function PDFViewer({ data, pageNumber, zoom }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let cancelled = false;

    const render = async () => {
      try {
        setError(null);
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const copy = data.slice(0);
        const loadingTask = pdfjsLib.getDocument({ data: copy });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: zoom * dpr });

        const canvas = canvasRef.current!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Rendering cancelled') return;
        setError('페이지를 렌더링할 수 없습니다.');
        console.error(err);
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [data, pageNumber, zoom]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
    );
  }

  return (
    <div className="pdf-canvas-wrapper flex justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
}
