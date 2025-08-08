import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-slate-600 border-t-amber-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-slate-300">Những sợi chỉ vận mệnh đang được dệt...</p>
    </div>
  );
};