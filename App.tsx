import React, { useState, useCallback } from 'react';
import DropZone from './components/DropZone';
import Configuration from './components/Configuration';
import PreviewTable from './components/PreviewTable';
import { processZipFile } from './utils/zipProcessor';
import { ProcessedFile, ProcessingStats } from './types';
import { Download, RefreshCw, FileArchive, Loader2 } from 'lucide-react';

export default function App() {
  const [paddingLength, setPaddingLength] = useState<number>(3);
  const [preserveFileName, setPreserveFileName] = useState<boolean>(false);
  const [originalFileName, setOriginalFileName] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProcessedFiles([]);
    setStats(null);
    setProgress(0);
    setOriginalFileName(file.name);

    try {
      // Simulate a small delay for better UX
      await new Promise(r => setTimeout(r, 500));

      const [files, finalStats] = await processZipFile(
        file, 
        paddingLength, 
        (percent) => setProgress(percent)
      );

      setProcessedFiles(files);
      setStats(finalStats);
    } catch (err: any) {
      console.error(err);
      setError("Đã xảy ra lỗi khi xử lý file Zip. Hãy chắc chắn file không bị lỗi.");
    } finally {
      setIsProcessing(false);
    }
  }, [paddingLength]);

  const handleDownload = () => {
    if (stats?.processedZipBlob) {
      const url = URL.createObjectURL(stats.processedZipBlob);
      const a = document.createElement('a');
      a.href = url;
      
      if (preserveFileName && originalFileName) {
        a.download = originalFileName;
      } else {
        a.download = `renamed_images_pad${paddingLength}.zip`;
      }
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setProcessedFiles([]);
    setStats(null);
    setProgress(0);
    setError(null);
    // Note: We don't reset originalFileName or preserveFileName to allow quick retry with same settings
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Zip Image Renamer
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Công cụ tự động thêm số 0 vào tên file (Zero-padding) trong file Zip. 
            Tương tự như script Python nhưng chạy trực tiếp trên trình duyệt của bạn.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Config Panel */}
          <Configuration 
            paddingLength={paddingLength} 
            setPaddingLength={setPaddingLength}
            preserveFileName={preserveFileName}
            setPreserveFileName={setPreserveFileName}
            disabled={isProcessing || stats !== null}
          />

          {/* Upload Area / Processing State */}
          {!stats && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               {error && (
                 <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                   {error}
                 </div>
               )}
               
               {isProcessing ? (
                 <div className="flex flex-col items-center justify-center py-12">
                   <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                   <p className="text-lg font-medium text-slate-800">Đang xử lý...</p>
                   <div className="w-64 h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">
                     <div 
                        className="h-full bg-indigo-600 transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                     />
                   </div>
                   <p className="text-sm text-slate-500 mt-2">{progress}% hoàn thành</p>
                 </div>
               ) : (
                 <DropZone onFileSelected={handleFileSelected} isProcessing={isProcessing} />
               )}
             </div>
          )}

          {/* Results Area */}
          {stats && (
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full text-green-600">
                    <FileArchive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Xử lý hoàn tất!</h3>
                    <p className="text-slate-600">
                      Đã đổi tên <span className="font-bold text-indigo-600">{stats.renamedCount}</span> / {stats.totalFiles} tệp.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleReset}
                    className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Làm lại
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md transition-all hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Tải về Zip
                  </button>
                </div>
              </div>

              {/* Preview List */}
              <PreviewTable files={processedFiles} />
            </div>
          )}
        </div>
        
        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>Local processing only. No files are uploaded to any server.</p>
        </footer>
      </div>
    </div>
  );
}