import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, Pencil, Eraser, Undo2, Trash2 } from 'lucide-react';

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onDownload: () => void;
  isDrawingMode: boolean;
  onToggleDrawing: () => void;
  drawColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  isEraser: boolean;
  onToggleEraser: () => void;
  onUndo: () => void;
  onClearDrawings: () => void;
}

const COLORS = [
  { value: '#111827', label: '검정' },
  { value: '#ef4444', label: '빨강' },
  { value: '#3b82f6', label: '파랑' },
  { value: '#22c55e', label: '초록' },
  { value: '#eab308', label: '노랑' },
  { value: '#f97316', label: '주황' },
];

const SIZES = [
  { value: 2, label: 'S' },
  { value: 5, label: 'M' },
  { value: 10, label: 'L' },
];

export default function Toolbar({
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomChange,
  onRotateLeft,
  onRotateRight,
  onDownload,
  isDrawingMode,
  onToggleDrawing,
  drawColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  isEraser,
  onToggleEraser,
  onUndo,
  onClearDrawings,
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

      {/* 그리기 토글 */}
      <button
        onClick={onToggleDrawing}
        className={`p-1.5 rounded transition-colors ${
          isDrawingMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
        }`}
        title="그리기 모드"
      >
        <Pencil size={18} />
      </button>

      {isDrawingMode && (
        <>
          <div className="w-px h-6 bg-gray-200" />

          {/* 색상 선택 */}
          <div className="flex items-center gap-1">
            {COLORS.map(({ value, label }) => (
              <button
                key={value}
                title={label}
                onClick={() => {
                  onColorChange(value);
                  if (isEraser) onToggleEraser();
                }}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  drawColor === value && !isEraser
                    ? 'border-gray-700 scale-125'
                    : 'border-transparent hover:border-gray-400'
                }`}
                style={{ backgroundColor: value }}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* 굵기 */}
          <div className="flex items-center gap-1">
            {SIZES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onStrokeWidthChange(value)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  strokeWidth === value
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={`굵기 ${label}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* 지우개 */}
          <button
            onClick={onToggleEraser}
            className={`p-1.5 rounded transition-colors ${
              isEraser ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="지우개"
          >
            <Eraser size={18} />
          </button>

          {/* 실행 취소 */}
          <button
            onClick={onUndo}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
            title="실행 취소"
          >
            <Undo2 size={18} />
          </button>

          {/* 그림 전체 지우기 */}
          <button
            onClick={onClearDrawings}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
            title="이 페이지 그림 모두 지우기"
          >
            <Trash2 size={18} />
          </button>
        </>
      )}

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
