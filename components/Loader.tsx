import React from 'react';

export const Loader: React.FC = () => {
  return (
    // This transparent overlay prevents interaction with the UI behind it, fulfilling "chỉ khóa tương tác thôi".
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
        {/* The visible loader element is smaller and less intrusive, allowing the user to read the story. */}
        <div className="flex items-center gap-4 p-4 bg-slate-900/90 border border-slate-700 rounded-lg shadow-2xl backdrop-blur-sm">
             <div className="w-8 h-8 border-4 border-slate-600 border-t-amber-400 rounded-full animate-spin"></div>
             <p className="text-lg text-slate-300">Những sợi chỉ vận mệnh đang được dệt...</p>
        </div>
    </div>
  );
};
