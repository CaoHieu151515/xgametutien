
import React from 'react';
import { WorldSettings } from '../../types';
import { FormInput, FormTextArea, FormLabel, RemoveIcon } from './common';

interface WorldTabProps {
    worldSettings: WorldSettings;
    handleWorldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handlePowerSystemChange: (id: string, field: 'name' | 'realms', value: string) => void;
    handleAddPowerSystem: () => void;
    handleRemovePowerSystem: (id: string) => void;
}

export const WorldTab: React.FC<WorldTabProps> = ({ worldSettings, handleWorldChange, handlePowerSystemChange, handleAddPowerSystem, handleRemovePowerSystem }) => {
    return (
        <div className="space-y-6">
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

            <div>
                <FormLabel htmlFor="theme">Chủ đề thế giới</FormLabel>
                <FormInput id="theme" name="theme" value={worldSettings.theme} onChange={handleWorldChange} placeholder="Ví dụ: Thế giới tiên hiệp phương Đông, thế giới ma pháp phương Tây..." />
            </div>
            <div>
                <FormLabel htmlFor="genre">Thể loại</FormLabel>
                <FormInput id="genre" name="genre" value={worldSettings.genre} onChange={handleWorldChange} placeholder="Ví dụ: Tu Tiên, Huyền Huyễn, Đô Thị..." />
            </div>
            <div>
                <FormLabel htmlFor="context">Chi tiết bối cảnh</FormLabel>
                <FormTextArea id="context" name="context" value={worldSettings.context} onChange={handleWorldChange} rows={4} />
            </div>
            
            <div className="space-y-4 border-t border-slate-700 pt-4">
            {worldSettings.powerSystems && worldSettings.powerSystems.filter(system => system && system.id).map((system, index) => (
                <div key={system.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-amber-300">Hệ Thống Sức Mạnh {index + 1}</h3>
                        {worldSettings.powerSystems.length > 1 && (
                            <button type="button" onClick={() => handleRemovePowerSystem(system.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                <RemoveIcon />
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div>
                            <FormLabel htmlFor={`ps-name-${system.id}`}>Tên Hệ Thống Sức Mạnh</FormLabel>
                            <FormInput id={`ps-name-${system.id}`} value={system.name} onChange={(e) => handlePowerSystemChange(system.id, 'name', e.target.value)} />
                        </div>
                        <div>
                            <FormLabel htmlFor={`ps-realms-${system.id}`}>Các Cảnh Giới (phân cách bởi ' - ')</FormLabel>
                            <FormTextArea id={`ps-realms-${system.id}`} value={system.realms} onChange={(e) => handlePowerSystemChange(system.id, 'realms', e.target.value)} rows={4}/>
                        </div>
                    </div>
                </div>
            ))}
            </div>

            <button
                type="button"
                onClick={handleAddPowerSystem}
                className="w-full py-2 px-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-amber-300 hover:border-amber-400 transition-all"
            >
                + Thêm Hệ Thống Sức Mạnh
            </button>
        </div>
    );
};
