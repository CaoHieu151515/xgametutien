

import React, { useState, useEffect } from 'react';
import { NarrativePerspective, ApiProvider, AppSettings, StoredApiKey } from '../../types';
import { MatureContentToggle } from '../MatureContentToggle';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: AppSettings) => void;
    initialSettings: AppSettings;
}

const RemoveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);


export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialSettings }) => {
    const [settings, setSettings] = useState<AppSettings>(initialSettings);
    const [newGeminiKeyName, setNewGeminiKeyName] = useState('');
    const [newGeminiKeyValue, setNewGeminiKeyValue] = useState('');

    useEffect(() => {
        setSettings(initialSettings);
    }, [isOpen, initialSettings]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    const handleGeminiUseDefaultChange = (useDefault: boolean) => {
        setSettings(prev => ({
            ...prev,
            gemini: { ...prev.gemini, useDefault }
        }));
    };

    const handleAddGeminiKey = () => {
        if (!newGeminiKeyName.trim() || !newGeminiKeyValue.trim()) return;
        const newKey: StoredApiKey = {
            id: `gemini_${Date.now()}`,
            name: newGeminiKeyName.trim(),
            key: newGeminiKeyValue.trim(),
        };

        const updatedKeys = [...settings.gemini.customKeys, newKey];
        
        setSettings(prev => ({
            ...prev,
            gemini: {
                ...prev.gemini,
                customKeys: updatedKeys,
                // Automatically select the new key if it's the first one
                activeCustomKeyId: prev.gemini.activeCustomKeyId === null ? newKey.id : prev.gemini.activeCustomKeyId,
                useDefault: false, // Switch to custom if adding a key
            }
        }));

        setNewGeminiKeyName('');
        setNewGeminiKeyValue('');
    };

    const handleRemoveGeminiKey = (idToRemove: string) => {
        const updatedKeys = settings.gemini.customKeys.filter(k => k.id !== idToRemove);
        setSettings(prev => ({
            ...prev,
            gemini: {
                ...prev.gemini,
                customKeys: updatedKeys,
                // If the active key was deleted, select another one or none
                activeCustomKeyId: prev.gemini.activeCustomKeyId === idToRemove
                    ? (updatedKeys.length > 0 ? updatedKeys[0].id : null)
                    : prev.gemini.activeCustomKeyId,
            }
        }));
    };

    const renderGeminiSettings = () => (
        <>
            <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800">
                    <input
                        type="radio"
                        name="geminiKeyChoice"
                        checked={settings.gemini.useDefault}
                        onChange={() => handleGeminiUseDefaultChange(true)}
                        className="form-radio h-5 w-5 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-300 font-medium">Dùng API Key mặc định (Khuyến khích)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800">
                    <input
                        type="radio"
                        name="geminiKeyChoice"
                        checked={!settings.gemini.useDefault}
                        onChange={() => handleGeminiUseDefaultChange(false)}
                        className="form-radio h-5 w-5 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-300 font-medium">Dùng API Key tùy chỉnh</span>
                </label>
            </div>
            {!settings.gemini.useDefault && (
                <div className="mt-4 pl-4 border-l-2 border-slate-700 space-y-4 animate-fade-in">
                    <h4 className="text-md font-semibold text-slate-300">Danh sách Key tùy chỉnh</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600">
                        {settings.gemini.customKeys.length > 0 ? (
                            settings.gemini.customKeys.map(key => (
                                <div key={key.id} className="flex items-center justify-between p-2 rounded bg-slate-800/70">
                                    <label className="flex items-center space-x-3 cursor-pointer flex-grow">
                                        <input
                                            type="radio"
                                            name="activeGeminiKey"
                                            checked={settings.gemini.activeCustomKeyId === key.id}
                                            onChange={() => setSettings(p => ({...p, gemini: {...p.gemini, activeCustomKeyId: key.id}}))}
                                            className="form-radio h-4 w-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500"
                                        />
                                        <span className="text-slate-300">{key.name}</span>
                                    </label>
                                    <button onClick={() => handleRemoveGeminiKey(key.id)} className="text-slate-500 hover:text-red-400">
                                        <RemoveIcon />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-2">Chưa có key tùy chỉnh nào.</p>
                        )}
                    </div>
                    <div className="space-y-3 pt-4 border-t border-slate-700">
                        <h5 className="text-sm font-semibold text-amber-200">Thêm Key mới</h5>
                         <div>
                            <label htmlFor="gemini-key-name" className="block text-xs font-medium text-slate-400 mb-1">Tên Key (để gợi nhớ)</label>
                            <input
                                id="gemini-key-name"
                                type="text"
                                value={newGeminiKeyName}
                                onChange={(e) => setNewGeminiKeyName(e.target.value)}
                                placeholder="Ví dụ: Key dự án X"
                                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                            />
                        </div>
                        <div>
                             <label htmlFor="gemini-key-value" className="block text-xs font-medium text-slate-400 mb-1">API Key</label>
                            <input
                                id="gemini-key-value"
                                type="password"
                                value={newGeminiKeyValue}
                                onChange={(e) => setNewGeminiKeyValue(e.target.value)}
                                placeholder="Nhập API Key tại đây"
                                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                            />
                        </div>
                        <button onClick={handleAddGeminiKey} className="w-full py-2 bg-amber-800 hover:bg-amber-700 rounded-lg font-semibold text-sm transition-colors">Thêm Key</button>
                    </div>
                </div>
            )}
        </>
    );

    const renderOpenAISettings = () => (
         <div className="mt-4">
            <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-300 mb-1">API Key (OpenAI)</label>
            <input
                id="api-key-input"
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => setSettings(p => ({ ...p, openaiApiKey: e.target.value }))}
                placeholder="Nhập API Key của bạn tại đây"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200"
            />
        </div>
    );

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-8 w-full max-w-lg m-4 text-slate-200 flex flex-col max-h-[95vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-6 text-amber-300 flex-shrink-0">Cài đặt</h2>
                
                <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
                    {/* API Provider */}
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-slate-300">Nhà Cung Cấp AI</h3>
                         <div className="space-y-4">
                            <div>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="apiProvider"
                                        value={ApiProvider.GEMINI}
                                        checked={settings.apiProvider === ApiProvider.GEMINI}
                                        onChange={() => setSettings(p => ({ ...p, apiProvider: ApiProvider.GEMINI }))}
                                        className="form-radio h-5 w-5 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500"
                                    />
                                    <span className="text-slate-300 font-medium">Google Gemini</span>
                                </label>
                            </div>
                             <div>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="apiProvider"
                                        value={ApiProvider.OPENAI}
                                        checked={settings.apiProvider === ApiProvider.OPENAI}
                                        onChange={() => setSettings(p => ({ ...p, apiProvider: ApiProvider.OPENAI }))}
                                        className="form-radio h-5 w-5 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500"
                                    />
                                    <span className="text-slate-300 font-medium">OpenAI ChatGPT</span>
                                </label>
                            </div>
                        </div>
                        
                        {settings.apiProvider === ApiProvider.GEMINI ? renderGeminiSettings() : renderOpenAISettings()}

                        <p className="text-xs text-slate-500 mt-3 p-2 bg-slate-800 rounded-md border border-slate-700">
                           Lưu ý: API Key của bạn chỉ được lưu trữ cục bộ trong trình duyệt của bạn và không bao giờ được gửi đến máy chủ của chúng tôi.
                        </p>
                    </div>

                    {/* Font Size */}
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <label htmlFor="font-size-slider" className="text-lg font-semibold mb-3 text-slate-300 block">
                            Cỡ chữ truyện
                        </label>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSettings(p => ({ ...p, storyFontSize: Math.max(14, p.storyFontSize - 1) }))}
                                className="px-3 py-1 bg-slate-700 rounded-md font-bold hover:bg-slate-600">-</button>
                            <input
                                id="font-size-slider"
                                type="range"
                                min="14"
                                max="28"
                                step="1"
                                value={settings.storyFontSize}
                                onChange={(e) => setSettings(p => ({ ...p, storyFontSize: parseInt(e.target.value, 10) }))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <button
                                onClick={() => setSettings(p => ({ ...p, storyFontSize: Math.min(28, p.storyFontSize + 1) }))}
                                className="px-3 py-1 bg-slate-700 rounded-md font-bold hover:bg-slate-600">+</button>
                            <span className="font-bold text-amber-300 w-12 text-center bg-slate-700 p-1 rounded-md text-sm">{settings.storyFontSize}px</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                            Thay đổi kích thước chữ trong phần tường thuật và hội thoại của câu chuyện.
                        </p>
                    </div>

                    {/* History Context */}
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <label htmlFor="history-context-slider" className="text-lg font-semibold mb-3 text-slate-300 block">
                            Trí nhớ Ngữ cảnh
                            <span className="text-base font-normal text-slate-400 ml-2">
                                ({settings.historyContextSize === 0 ? "Tắt" : `${settings.historyContextSize} lượt gần nhất`})
                            </span>
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                id="history-context-slider"
                                type="range"
                                min="0"
                                max="20"
                                step="1"
                                value={settings.historyContextSize}
                                onChange={(e) => setSettings(p => ({ ...p, historyContextSize: parseInt(e.target.value, 10) }))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <span className="font-bold text-amber-300 w-8 text-center bg-slate-700 p-1 rounded-md">{settings.historyContextSize}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                            Điều chỉnh "trí nhớ ngắn hạn" của AI bằng cách cho nó xem lại các lượt đi trước. Số lớn hơn giúp AI nhớ tốt hơn nhưng có thể tốn nhiều token hơn và chậm hơn. 0 để tắt.
                        </p>
                    </div>

                    {/* Mature Content Toggle */}
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <MatureContentToggle
                            isChecked={settings.isMature}
                            onChange={(checked) => setSettings(p => ({...p, isMature: checked}))}
                            disabled={false}
                        />
                    </div>

                    {/* Narrative Perspective */}
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-slate-300">Phong cách kể chuyện</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="perspective"
                                        value={NarrativePerspective.SECOND_PERSON}
                                        checked={settings.perspective === NarrativePerspective.SECOND_PERSON}
                                        onChange={() => setSettings(p => ({...p, perspective: NarrativePerspective.SECOND_PERSON}))}
                                        className="form-radio h-5 w-5 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500"
                                    />
                                    <span className="text-slate-300 font-medium">Ngôi thứ hai (Bạn...)</span>
                                </label>
                                <p className="text-sm text-slate-400 mt-1 ml-8">Câu chuyện được kể bởi một người dẫn truyện nói chuyện trực tiếp với bạn. Phong cách này tạo cảm giác được dẫn dắt trong một cuộc phiêu lưu sử thi.</p>
                            </div>
                            <div>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="perspective"
                                        value={NarrativePerspective.FIRST_PERSON}
                                        checked={settings.perspective === NarrativePerspective.FIRST_PERSON}
                                        onChange={() => setSettings(p => ({...p, perspective: NarrativePerspective.FIRST_PERSON}))}
                                        className="form-radio h-5 w-5 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500"
                                    />
                                    <span className="text-slate-300 font-medium">Ngôi thứ nhất (Tôi...)</span>
                                </label>
                                <p className="text-sm text-slate-400 mt-1 ml-8">Bạn sẽ trải nghiệm câu chuyện qua đôi mắt của nhân vật. Mọi suy nghĩ và cảm xúc được thể hiện qua lời kể "Tôi", mang lại sự nhập tâm sâu sắc.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors duration-300"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-lg bg-amber-600 text-slate-900 font-bold hover:bg-amber-500 transition-colors duration-300"
                    >
                        Lưu & Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};
