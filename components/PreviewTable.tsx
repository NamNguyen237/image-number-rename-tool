import React, { useMemo } from 'react';
import { ProcessedFile } from '../types';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface PreviewTableProps {
  files: ProcessedFile[];
}

const PreviewTable: React.FC<PreviewTableProps> = ({ files }) => {
  // Show only first 50 items for performance if list is huge, or make it scrollable
  const displayFiles = useMemo(() => files.slice(0, 100), [files]);
  const hiddenCount = files.length - displayFiles.length;

  if (files.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[400px]">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-700">Xem trước kết quả ({files.length} tệp)</h3>
        <span className="text-xs text-slate-500">Chỉ hiển thị 100 tệp đầu tiên</span>
      </div>
      
      <div className="overflow-y-auto flex-1 p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-500">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-slate-500">Tên gốc</th>
              <th className="px-4 py-3 font-medium text-slate-500"></th>
              <th className="px-4 py-3 font-medium text-slate-500">Tên mới</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayFiles.map((file, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2">
                  {file.status === 'renamed' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Changed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      <AlertCircle className="w-3 h-3 mr-1" /> Skipped
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-slate-600 font-mono truncate max-w-[150px]" title={file.originalName}>
                  {file.originalName}
                </td>
                <td className="px-4 py-2 text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                </td>
                <td className="px-4 py-2 font-mono font-medium text-indigo-600 truncate max-w-[150px]" title={file.newName}>
                  {file.newName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {hiddenCount > 0 && (
          <div className="p-4 text-center text-sm text-slate-500 border-t border-slate-100">
            ... và {hiddenCount} tệp khác
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewTable;
