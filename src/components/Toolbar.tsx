import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onDownload: () => void;
}

export default function Toolbar({
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomChange,
  onRotateLeft,
  onRotateRight,
  onDownload,
}: ToolbarProps) {
  const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const adjustZoom = (delta: number) => {
    const currentIdx = zoomLevels.findIndex((z) => z >= zoom);
    const nextIdx = Math.max(0, Math.min(zoomLevels.length - 1, currentIdx + delta));
    onZoomChange(zoomLevels[nextIdx]);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 flex-wrap">
      {/* 페이지 네비게이션 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="이전 페이지"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-gray-600 min-w-[80px] text-center">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="다음 페이지"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* 확대/축소 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => adjustZoom(-1)}
          disabled={zoom <= zoomLevels[0]}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="축소"
        >
          <ZoomOut size={18} />
        </button>
        <span className="text-sm text-gray-600 min-w-[48px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => adjustZoom(1)}
          disabled={zoom >= zoomLevels[zoomLevels.length - 1]}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="확대"
        >
          <ZoomIn size={18} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* 회전 */}
      <div className="flex items-center gap-1">
        <button
          onClick={onRotateLeft}
          className="p-1.5 rounded hover:bg-gray-100"
          title="왼쪽으로 90° 회전"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={onRotateRight}
          className="p-1.5 rounded hover:bg-gray-100"
          title="오른쪽으로 90° 회전"
        >
          <RotateCw size={18} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* 다운로드 */}
      <button
        onClick={onDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
      >
        <Download size={16} />
        다운로드
      </button>
    </div>
  );
}
