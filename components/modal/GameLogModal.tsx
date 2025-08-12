import React from 'react';
import { GameSnapshot } from '../../types';
import { RewindIcon } from '../ui/Icons';


const LogEntry = ({ snapshot, onRewind, isRewindable }: { snapshot: GameSnapshot; onRewind: (turnNumber: number) => void; isRewindable: boolean }) => {
    const { turnNumber, turnContent } = snapshot;

    return (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="p-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-100">Lượt {turnNumber}</h3>
                {isRewindable && (
                    <button
                        onClick={() => onRewind(turnNumber)}
                        className="flex items-center px-3 py-1.5 bg-amber-600 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors text-sm"
                    >
                        <RewindIcon />
                        Quay lại
                    </button>
                )}
            </div>
            <div className="px-4 pb-4 border-t border-slate-700 space-y-4">
                <p className="font-sans text-amber-400 italic border-b border-slate-700/50 pb-4" style={{ fontSize: 'var(--story-font-size-large)' }}>
                    {turnContent.playerAction
                        ? `Lựa chọn: "${turnContent.playerAction.text}"`
                        : "Khởi đầu câu chuyện"
                    }
                </p>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap" style={{ fontSize: 'var(--story-font-size-xl)' }}>
                    {turnContent.storyResult.text}
                </p>
            </div>
        </div>
    );
};

interface GameLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: GameSnapshot[];
    onRewind: (turnNumber: number) => void;
}

export const GameLogModal: React.FC<GameLogModalProps> = ({ isOpen, onClose, log, onRewind }) => {

    if (!isOpen) {
        return null;
    }

    const reversedLog = [...log].reverse();

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-title"
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-4 flex justify-between items-center border-b border-slate-700">
                    <h2 id="log-title" className="text-2xl font-bold text-amber-300">Nhật Ký Trò Chơi</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Đóng">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {reversedLog.length > 0 ? (
                        reversedLog.map((snapshot) => (
                            <LogEntry
                                key={snapshot.turnNumber}
                                snapshot={snapshot}
                                onRewind={(turnNumber) => {
                                    onRewind(turnNumber);
                                    onClose();
                                }}
                                isRewindable={!!snapshot.preActionState && snapshot.turnNumber > 1}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-500">
                            <p>Nhật ký còn trống.</p>
                            <p>Hãy bắt đầu hành động để viết nên câu chuyện của bạn!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
