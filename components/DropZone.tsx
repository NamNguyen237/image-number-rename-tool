import React, { useRef, useState } from 'react';
import { UploadCloud, FileArchive } from 'lucide-react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndPass(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPass(e.target.files[0]);
    }
  };

  const validateAndPass = (file: File) => {
    if (file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
      onFileSelected(file);
    } else {
      alert("Vui lòng chỉ tải lên file .zip");
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isProcessing && inputRef.current?.click()}
      className={`
        relative group cursor-pointer flex flex-col items-center justify-center 
        w-full h-48 border-2 border-dashed rounded-xl transition-all duration-200
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept=".zip,application/zip,application/x-zip-compressed"
        className="hidden"
      />
      
      <div className="flex flex-col items-center text-center p-4">
        {isDragging ? (
          <FileArchive className="w-12 h-12 text-indigo-600 mb-3 animate-bounce" />
        ) : (
          <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors" />
        )}
        
        <p className="text-lg font-medium text-slate-700">
          {isDragging ? 'Thả file Zip vào đây' : 'Kéo thả hoặc Click để chọn file ZIP'}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Chỉ hỗ trợ định dạng .zip chứa hình ảnh
        </p>
      </div>
    </div>
  );
};

export default DropZone;
