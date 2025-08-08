
import React from 'react';
import { GameState } from '../../types';
import { ContinueIcon, JourneyIcon, SavesIcon, SettingsIcon } from '../ui/Icons';

interface HomeScreenProps {
    hasSaves: boolean;
    onContinue: () => void;
    onSetGameState: (state: GameState) => void;
    onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ hasSaves, onContinue, onSetGameState, onOpenSettings }) => (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center animate-fade-in bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,80,20,0.25),rgba(255,255,255,0))]">
         <div className="relative z-10 flex flex-col items-center">
            <h1 
                className="text-6xl md:text-7xl lg:text-8xl font-black text-amber-300 mb-4"
                style={{ textShadow: '0 0 25px rgba(252, 211, 77, 0.5), 0 0 8px rgba(252, 211, 77, 0.8)' }}
            >
                Tu Tiên Truyện
            </h1>
            <p className="text-slate-400 text-lg mb-12 max-w-3xl mx-auto">
                Một game nhập vai tiểu thuyết tương tác nơi bạn định hình câu chuyện tu tiên của riêng mình. Đưa ra lựa chọn, viết hành động của riêng bạn và xem câu chuyện diễn ra dựa trên quyết định của bạn, được hỗ trợ bởi AI.
            </p>
            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                {hasSaves && (
                     <button
                        onClick={onContinue}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-transform hover:scale-105 duration-300 text-xl shadow-lg shadow-green-600/20"
                    >
                        <ContinueIcon />
                        Tiếp Tục Chơi
                    </button>
                )}
                 <button
                    onClick={() => onSetGameState(GameState.WORLD_SETUP)}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-amber-600 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-transform hover:scale-105 duration-300 text-xl shadow-lg shadow-amber-600/20"
                >
                    <JourneyIcon />
                    Bắt Đầu Hành Trình
                </button>
                <button
                    onClick={() => onSetGameState(GameState.SAVE_MANAGEMENT)}
                    className="w-full flex items-center justify-center gap-3 p-3 bg-slate-700/80 text-slate-100 font-bold rounded-lg hover:bg-slate-600 transition-transform hover:scale-105 duration-300"
                >
                    <SavesIcon />
                    Quản lý lưu trữ
                </button>
                <button type="button" onClick={onOpenSettings} className="w-full flex items-center justify-center gap-3 p-3 bg-slate-800/80 text-slate-300 font-bold rounded-lg hover:bg-slate-700 transition-transform hover:scale-105 duration-300" aria-label="Mở cài đặt">
                    <SettingsIcon />
                    Cài đặt
                </button>
            </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
    </div>
);