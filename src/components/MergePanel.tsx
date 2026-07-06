import { useState } from 'react';
import { X, ArrowUp, ArrowDown, Merge } from 'lucide-react';
import FileUpload from './FileUpload';
import { mergePDFs, downloadBuffer, formatFileSize } from '../utils/pdfUtils';
import { PDFDocument } from 'pdf-lib';

interface PdfItem {
  id: string;
  name: string;
  size: number;
  data: ArrayBuffer;
  pageCount: number;
}

export default function MergePanel() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: File[]) => {
    const newItems: PdfItem[] = [];
    for (const file of files) {
      const data = await file.arrayBuffer();
      const doc = await PDFDocument.load(data);
      newItems.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        data,
        pageCount: doc.getPageCount(),
      });
    }
    setItems((prev) => [...prev, ...newItems]);
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const move = (id: string, dir: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const handleMerge = async () => {
    if (items.length < 2) return;
    setLoading(true);
    try {
      const result = await mergePDFs(items.map((i) => i.data));
      downloadBuffer(result, 'merged.pdf');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">PDF 병합</h2>
        <p className="text-sm text-gray-500">여러 PDF 파일을 하나로 합칩니다. 순서를 조정한 후 병합하세요.</p>
      </div>

      <FileUpload
        onFiles={handleFiles}
        multiple
        label="PDF 파일들을 끌어다 놓거나 클릭하여 추가"
        sublabel="여러 파일을 한 번에 선택할 수 있습니다"
      />

      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0"
            >
              <span className="text-sm text-gray-400 w-6 text-center">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.pageCount}페이지 · {formatFileSize(item.size)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => move(item.id, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => move(item.id, 1)}
                  disabled={idx === items.length - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => remove(item.id)}
                  className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleMerge}
        disabled={items.length < 2 || loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          '처리 중...'
        ) : (
          <>
            <Merge size={18} />
            {items.length}개 파일 병합 후 다운로드
          </>
        )}
      </button>
    </div>
  );
}
