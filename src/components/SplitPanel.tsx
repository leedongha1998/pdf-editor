import { useState } from 'react';
import { Scissors } from 'lucide-react';
import FileUpload from './FileUpload';
import { splitPDF, downloadBuffer } from '../utils/pdfUtils';
import { PDFDocument } from 'pdf-lib';

export default function SplitPanel() {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleFile = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const doc = await PDFDocument.load(data);
    setPdfData(data);
    setFileName(file.name);
    setPageCount(doc.getPageCount());
    setSelected(new Set());
  };

  const togglePage = (pageIndex: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pageIndex)) next.delete(pageIndex);
      else next.add(pageIndex);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(Array.from({ length: pageCount }, (_, i) => i)));
  const clearAll = () => setSelected(new Set());

  const handleSplit = async () => {
    if (!pdfData || selected.size === 0) return;
    setLoading(true);
    try {
      const indices = Array.from(selected).sort((a, b) => a - b);
      const result = await splitPDF(pdfData, indices);
      const baseName = fileName.replace(/\.pdf$/i, '');
      downloadBuffer(result, `${baseName}_split.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">PDF 분할</h2>
        <p className="text-sm text-gray-500">원하는 페이지를 선택하여 새 PDF로 추출합니다.</p>
      </div>

      {!pdfData ? (
        <FileUpload onFiles={handleFile} />
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 flex items-center justify-between">
            <span>
              <strong>{fileName}</strong> — 총 {pageCount}페이지
            </span>
            <button
              onClick={() => { setPdfData(null); setSelected(new Set()); }}
              className="text-blue-500 hover:text-blue-700 underline text-xs"
            >
              파일 변경
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={selectAll} className="text-sm text-blue-600 hover:underline">
              전체 선택
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={clearAll} className="text-sm text-gray-500 hover:underline">
              선택 해제
            </button>
            <span className="ml-auto text-sm text-gray-500">
              {selected.size}페이지 선택됨
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => togglePage(i)}
                className={`py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selected.has(i)
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={handleSplit}
            disabled={selected.size === 0 || loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              '처리 중...'
            ) : (
              <>
                <Scissors size={18} />
                선택한 {selected.size}페이지 추출
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
