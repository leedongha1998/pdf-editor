import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  label?: string;
  sublabel?: string;
}

export default function FileUpload({
  onFiles,
  accept = { 'application/pdf': ['.pdf'] },
  multiple = false,
  label = 'PDF 파일을 여기에 끌어다 놓거나 클릭하여 업로드',
  sublabel = 'PDF 파일만 지원합니다',
}: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFiles,
    accept,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-3 text-gray-400" size={40} />
      <p className="text-gray-600 font-medium">{label}</p>
      <p className="text-gray-400 text-sm mt-1">{sublabel}</p>
    </div>
  );
}
