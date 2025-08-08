
import React from 'react';
import { WorldSettings } from '../../../types';
import { FormInput, FormLabel } from '../common';

interface TiersSectionProps {
    worldSettings: WorldSettings;
    handleWorldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TiersSection: React.FC<TiersSectionProps> = ({ worldSettings, handleWorldChange }) => (
    <div className="space-y-4">
        <div>
            <FormLabel htmlFor="qualityTiers">Tùy Chỉnh Phẩm Chất (phân cách bằng ' - ')</FormLabel>
            <FormInput id="qualityTiers" name="qualityTiers" value={worldSettings.qualityTiers} onChange={handleWorldChange} />
            <p className="text-xs text-slate-400 mt-2">Áp dụng cho phẩm chất của Kỹ Năng và Vật Phẩm.</p>
        </div>
        <div>
            <FormLabel htmlFor="aptitudeTiers">Tùy Chỉnh Tư Chất (phân cách bằng ' - ')</FormLabel>
            <FormInput id="aptitudeTiers" name="aptitudeTiers" value={worldSettings.aptitudeTiers} onChange={handleWorldChange} />
            <p className="text-xs text-slate-400 mt-2">Áp dụng cho Tư Chất của Nhân Vật. Thứ tự từ thấp đến cao.</p>
        </div>
    </div>
);