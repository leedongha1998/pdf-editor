import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Trash2 } from 'lucide-react';

interface PageThumbnailsProps {
  data: ArrayBuffer;
  pageCount: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
  onDeletePage: (pageIndex: number) => void;
}

function Thumbnail({
  data,
  pageNumber,
  isActive,
  onClick,
  onDelete,
}: {
  data: ArrayBuffer;
  pageNumber: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const copy = data.slice(0);
        const pdf = await pdfjsLib.getDocument({ data: copy }).promise;
        if (cancelled) return;
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = canvasRef.current!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch {
        // ignore cancelled renders
      }
    };
    render();
    return () => { cancelled = true; };
  }, [data, pageNumber]);

  return (
    <div
      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
        isActive ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={onClick}
    >
      <div className="bg-gray-100 flex items-center justify-center p-1">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>
      <div className="text-center text-xs py-1 text-gray-500 bg-white">{pageNumber}</div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        title="페이지 삭제"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

export default function PageThumbnails({
  data,
  pageCount,
  currentPage,
  onPageSelect,
  onDeletePage,
}: PageThumbnailsProps) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="w-36 flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto p-2 space-y-2">
      <p className="text-xs text-gray-500 text-center font-medium mb-2">
        총 {pageCount}페이지
      </p>
      {pages.map((page) => (
        <Thumbnail
          key={page}
          data={data}
          pageNumber={page}
          isActive={currentPage === page}
          onClick={() => onPageSelect(page)}
          onDelete={() => onDeletePage(page - 1)}
        />
      ))}
    </div>
  );
}
