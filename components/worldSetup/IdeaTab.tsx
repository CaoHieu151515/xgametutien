
import React from 'react';
import { WorldSettings } from '../../types';
import { FormLabel, FormTextArea, WandIcon } from './common';

interface IdeaTabProps {
    worldSettings: WorldSettings;
    handleWorldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleGenerateWorld: () => void;
    isLoading: boolean;
    error: string;
}

export const IdeaTab: React.FC<IdeaTabProps> = ({ worldSettings, handleWorldChange, handleGenerateWorld, isLoading, error }) => (
    <div className="space-y-6">
        <div>
            <FormLabel htmlFor="storyIdea">Ý Tưởng Cốt Truyện (Tổng quan)</FormLabel>
            <FormTextArea 
                id="storyIdea" 
                name="storyIdea" 
                value={worldSettings.storyIdea} 
                onChange={handleWorldChange} 
                rows={6}
                placeholder="Vd: Một nhân viên văn phòng chuyển sinh vào thế giới tu tiên, bắt đầu từ một phế vật nhưng có một hệ thống đặc biệt..." 
            />
        </div>
        <div>
            <FormLabel htmlFor="openingScene">Mô tả Phân Cảnh Mở Đầu (Chi tiết - Tùy chọn)</FormLabel>
            <FormTextArea 
                id="openingScene" 
                name="openingScene" 
                value={worldSettings.openingScene} 
                onChange={handleWorldChange} 
                rows={6}
                placeholder="Vd: Bầu trời thành phố đột nhiên bị xé toạc bởi một cánh cổng không gian khổng lồ. Mô tả sự hỗn loạn, hoảng sợ của người dân khi những sinh vật kỳ lạ đầu tiên bước ra..." 
            />
        </div>
         <button
            type="button"
            onClick={handleGenerateWorld}
            disabled={isLoading || !worldSettings.storyIdea.trim()}
            className="w-full flex items-center justify-center gap-3 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
            <WandIcon />
            Để AI Điền Giúp
        </button>
        {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
    </div>
);