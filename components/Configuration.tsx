import React from 'react';
import { Settings } from 'lucide-react';

interface ConfigurationProps {
  paddingLength: number;
  setPaddingLength: (val: number) => void;
  preserveFileName: boolean;
  setPreserveFileName: (val: boolean) => void;
  disabled: boolean;
}

const Configuration: React.FC<ConfigurationProps> = ({ 
  paddingLength, 
  setPaddingLength, 
  preserveFileName, 
  setPreserveFileName, 
  disabled 
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-800">Cấu hình (Configuration)</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label htmlFor="padding" className="text-sm font-medium text-slate-600 sm:w-48">
            Độ dài số (Padding Length):
          </label>
          <div className="relative">
            <input
              id="padding"
              type="number"
              min="1"
              max="10"
              value={paddingLength}
              onChange={(e) => setPaddingLength(parseInt(e.target.value) || 3)}
              disabled={disabled}
              className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 text-slate-900"
            />
            <span className="absolute left-full top-2 ml-3 text-xs text-slate-400 whitespace-nowrap hidden sm:inline-block">
              Ví dụ: 3 &rarr; 001.jpg
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="sm:w-48 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <input
              id="preserve"
              type="checkbox"
              checked={preserveFileName}
              onChange={(e) => setPreserveFileName(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
            />
            <label htmlFor="preserve" className={`text-sm font-medium ${disabled ? 'text-slate-400' : 'text-slate-700'} cursor-pointer select-none`}>
              Giữ nguyên tên file Zip gốc
            </label>
          </div>
        </div>
      </div>

      <p className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
        Logic: Tìm số ở đầu tên file và thêm số 0 vào trước cho đủ độ dài. (Python `zfill`)
      </p>
    </div>
  );
};

export default Configuration;