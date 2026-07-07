import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import DrawingCanvas, { Stroke } from './DrawingCanvas';
import TextLayer from './TextLayer';
import StampLayer from './StampLayer';
import { TextAnnotation, StampAnnotation } from '../types/pdf';

interface PDFViewerProps {
  data: ArrayBuffer;
  pageNumber: number;
  zoom: number;
  isDrawingMode: boolean;
  drawColor: string;
  strokeWidth: number;
  isEraser: boolean;
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  isTextMode: boolean;
  textColor: string;
  textFontSize: number;
  textAnnotations: TextAnnotation[];
  onTextAnnotationsChange: (annotations: TextAnnotation[]) => void;
  isStampMode: boolean;
  stampAnnotations: StampAnnotation[];
  onStampAnnotationsChange: (annotations: StampAnnotation[]) => void;
  stampName: string;
  stampColor: string;
  stampSize: number;
}

export default function PDFViewer({
  data,
  pageNumber,
  zoom,
  isDrawingMode,
  drawColor,
  strokeWidth,
  isEraser,
  strokes,
  onStrokesChange,
  isTextMode,
  textColor,
  textFontSize,
  textAnnotations,
  onTextAnnotationsChange,
  isStampMode,
  stampAnnotations,
  onStampAnnotationsChange,
  stampName,
  stampColor,
  stampSize,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
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

        setCanvasSize({ width: viewport.width, height: viewport.height });

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
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <canvas ref={canvasRef} />
        {canvasSize.width > 0 && (
          <>
            <DrawingCanvas
              isActive={isDrawingMode}
              color={drawColor}
              strokeWidth={strokeWidth}
              isEraser={isEraser}
              strokes={strokes}
              onStrokesChange={onStrokesChange}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
            />
            <TextLayer
              isActive={isTextMode}
              annotations={textAnnotations}
              onAnnotationsChange={onTextAnnotationsChange}
              color={textColor}
              fontSize={textFontSize}
            />
            <StampLayer
              isActive={isStampMode}
              annotations={stampAnnotations}
              onAnnotationsChange={onStampAnnotationsChange}
              stampName={stampName}
              stampColor={stampColor}
              stampSize={stampSize}
            />
          </>
        )}
      </div>
    </div>
  );
}
