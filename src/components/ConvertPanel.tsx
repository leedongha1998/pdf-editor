import { useState } from 'react';
import { X, FileDown } from 'lucide-react';
import FileUpload from './FileUpload';
import { imagesToPDF, downloadBuffer, formatFileSize } from '../utils/pdfUtils';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

export default function ConvertPanel() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (files: File[]) => {
    const newItems = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const remove = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setLoading(true);
    try {
      const result = await imagesToPDF(images.map((i) => i.file));
      downloadBuffer(result, 'converted.pdf');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">이미지 → PDF 변환</h2>
        <p className="text-sm text-gray-500">
          JPG, PNG 이미지를 PDF로 변환합니다. 여러 이미지를 한 PDF로 합칠 수 있습니다.
        </p>
      </div>

      <FileUpload
        onFiles={handleFiles}
        accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
        multiple
        label="이미지 파일을 끌어다 놓거나 클릭하여 추가"
        sublabel="JPG, PNG 파일을 지원합니다"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((item, idx) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white">
              <img
                src={item.preview}
                alt={item.file.name}
                className="w-full h-28 object-cover"
              />
              <div className="px-2 py-1.5">
                <p className="text-xs text-gray-600 truncate">{item.file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(item.file.size)}</p>
              </div>
              <div className="absolute top-1 left-1 bg-black/50 text-white text-xs rounded px-1">
                {idx + 1}
              </div>
              <button
                onClick={() => remove(item.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={images.length === 0 || loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          '변환 중...'
        ) : (
          <>
            <FileDown size={18} />
            {images.length}개 이미지를 PDF로 변환
          </>
        )}
      </button>
    </div>
  );
}
