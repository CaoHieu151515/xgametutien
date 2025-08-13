import React from 'react';

export const Loader: React.FC = () => {
  return (
    // Positioned at the top of the viewport, under the header. It does not block interaction with content.
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-4 p-4 bg-slate-900/90 border border-slate-700 rounded-lg shadow-2xl backdrop-blur-sm animate-fade-in">
             <div className="w-8 h-8 border-4 border-slate-600 border-t-amber-400 rounded-full animate-spin"></div>
             <p className="text-lg text-slate-300">Những sợi chỉ vận mệnh đang được dệt...</p>
        </div>
    </div>
  );
};