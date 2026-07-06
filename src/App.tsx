import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import PDFViewer from './components/PDFViewer';
import PageThumbnails from './components/PageThumbnails';
import Toolbar from './components/Toolbar';
import MergePanel from './components/MergePanel';
import SplitPanel from './components/SplitPanel';
import ConvertPanel from './components/ConvertPanel';
import { rotatePage, deletePage, downloadBuffer, formatFileSize } from './utils/pdfUtils';
import { ActiveTab, PDFFile } from './types/pdf';
import { Stroke } from './components/DrawingCanvas';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawColor, setDrawColor] = useState('#111827');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [drawingsByPage, setDrawingsByPage] = useState<Record<number, Stroke[]>>({});

  const currentStrokes = drawingsByPage[currentPage] ?? [];

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const doc = await PDFDocument.load(data);
    setPdfFile({
      id: crypto.randomUUID(),
      name: file.name,
      data,
      pageCount: doc.getPageCount(),
      size: file.size,
    });
    setCurrentPage(1);
    setZoom(1.0);
    setDrawingsByPage({});
    setIsDrawingMode(false);
  };

  const updatePdf = async (newData: ArrayBuffer) => {
    const doc = await PDFDocument.load(newData);
    const pageCount = doc.getPageCount();
    setPdfFile((prev) =>
      prev ? { ...prev, data: newData, pageCount } : null
    );
    if (currentPage > pageCount) setCurrentPage(pageCount);
  };

  const handleRotateLeft = async () => {
    if (!pdfFile) return;
    const result = await rotatePage(pdfFile.data, currentPage - 1, -90);
    await updatePdf(result);
  };

  const handleRotateRight = async () => {
    if (!pdfFile) return;
    const result = await rotatePage(pdfFile.data, currentPage - 1, 90);
    await updatePdf(result);
  };

  const handleDeletePage = async (pageIndex: number) => {
    if (!pdfFile || pdfFile.pageCount <= 1) return;
    const result = await deletePage(pdfFile.data, pageIndex);
    await updatePdf(result);
  };

  const handleDownload = () => {
    if (!pdfFile) return;
    downloadBuffer(pdfFile.data, pdfFile.name);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  const handleStrokesChange = (newStrokes: Stroke[]) => {
    setDrawingsByPage((prev) => ({ ...prev, [currentPage]: newStrokes }));
  };

  const handleClearDrawings = () => {
    setDrawingsByPage((prev) => ({ ...prev, [currentPage]: [] }));
  };

  const handleUndo = () => {
    setDrawingsByPage((prev) => {
      const strokes = prev[currentPage] ?? [];
      return { ...prev, [currentPage]: strokes.slice(0, -1) };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 overflow-hidden">
        {activeTab === 'editor' && (
          <div className="h-full flex flex-col">
            {!pdfFile ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-lg space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 text-center mb-2">
                    PDF 파일 열기
                  </h2>
                  <FileUpload onFiles={handleFileUpload} />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 text-sm text-gray-500">
                  <span className="font-medium text-gray-700 truncate max-w-xs">
                    {pdfFile.name}
                  </span>
                  <span>{formatFileSize(pdfFile.size)}</span>
                  <button
                    onClick={() => setPdfFile(null)}
                    className="ml-auto text-blue-600 hover:underline text-xs"
                  >
                    다른 파일 열기
                  </button>
                </div>

                <Toolbar
                  currentPage={currentPage}
                  totalPages={pdfFile.pageCount}
                  zoom={zoom}
                  onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(pdfFile.pageCount, p)))}
                  onZoomChange={setZoom}
                  onRotateLeft={handleRotateLeft}
                  onRotateRight={handleRotateRight}
                  onDownload={handleDownload}
                  isDrawingMode={isDrawingMode}
                  onToggleDrawing={() => setIsDrawingMode((v) => !v)}
                  drawColor={drawColor}
                  onColorChange={setDrawColor}
                  strokeWidth={strokeWidth}
                  onStrokeWidthChange={setStrokeWidth}
                  isEraser={isEraser}
                  onToggleEraser={() => setIsEraser((v) => !v)}
                  onUndo={handleUndo}
                  onClearDrawings={handleClearDrawings}
                />

                <div className="flex flex-1 overflow-hidden">
                  <PageThumbnails
                    data={pdfFile.data}
                    pageCount={pdfFile.pageCount}
                    currentPage={currentPage}
                    onPageSelect={setCurrentPage}
                    onDeletePage={handleDeletePage}
                  />

                  <div className="flex-1 overflow-auto p-6 bg-gray-200">
                    <PDFViewer
                      data={pdfFile.data}
                      pageNumber={currentPage}
                      zoom={zoom}
                      isDrawingMode={isDrawingMode}
                      drawColor={drawColor}
                      strokeWidth={strokeWidth}
                      isEraser={isEraser}
                      strokes={currentStrokes}
                      onStrokesChange={handleStrokesChange}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'merge' && <MergePanel />}
        {activeTab === 'split' && <SplitPanel />}
        {activeTab === 'convert' && <ConvertPanel />}
      </main>
    </div>
  );
}
