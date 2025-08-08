
import React from 'react';

interface ErrorScreenProps {
    error: string | null;
    onRestart: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRestart }) => (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center animate-fade-in">
        <h2 className="text-4xl text-red-400 mb-4">Một Vết Nứt Trong Thực Tại</h2>
        <p className="text-slate-400 mb-6 max-w-md">{error || 'Một lỗi không xác định đã xảy ra, làm gián đoạn dòng chảy của vận mệnh.'}</p>
        <button
            onClick={onRestart}
            className="p-3 px-6 bg-amber-600 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors duration-300"
        >
            Tạo nhân vật mới
        </button>
    </div>
);
