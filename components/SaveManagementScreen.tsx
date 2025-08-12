

import React, { useState, useEffect, useRef } from 'react';
import { SaveMetadata, FullGameState } from '../types';
import * as saveService from '../services/saveService';
import { Loader } from './Loader';

interface SaveManagementScreenProps {
    onLoadGame: (saveData: FullGameState) => void;
    onBackToMenu: () => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const SaveManagementScreen: React.FC<SaveManagementScreenProps> = ({ onLoadGame, onBackToMenu }) => {
    const [saves, setSaves] = useState<SaveMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchSaves = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const savesMetadata = await saveService.getAllSavesMetadata();
            setSaves(savesMetadata);
        } catch (err) {
            setError('Không thể tải danh sách lưu.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSaves();
    }, []);

    const handleExport = async (saveId: string) => {
        try {
            const saveData = await saveService.getGame(saveId);
            if (!saveData) throw new Error("Không tìm thấy bản lưu.");

            const jsonString = JSON.stringify(saveData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const now = new Date();
            const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
            const safeCharacterName = (saveData.characterProfile.name.trim() || 'NhanVat').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeCharacterName}_${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert(`Lỗi khi xuất file: ${(err as Error).message}`);
        }
    };

    const handleDelete = async (saveId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await saveService.deleteSave(saveId);
            await fetchSaves(); // Refetch the list from the database
        } catch (err) {
            setError(`Lỗi khi xóa bản lưu: ${(err as Error).message}`);
            setIsLoading(false); // Manually set loading to false on error
        }
    };

    const handleLoad = async (saveId: string) => {
        setIsLoading(true);
        try {
            const saveData = await saveService.getGame(saveId);
            if (!saveData) throw new Error("Không tìm thấy bản lưu.");
            onLoadGame(saveData);
        } catch (err) {
            alert(`Lỗi khi tải game: ${(err as Error).message}`);
            setIsLoading(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Không thể đọc tệp.");
                const data = JSON.parse(text);
                await saveService.importSave(data);
                alert("Nhập bản lưu thành công!");
                fetchSaves(); // Refresh list
            } catch (err) {
                alert(`Lỗi khi nhập tệp: ${(err as Error).message}`);
            } finally {
                setIsLoading(false);
                if (event.target) event.target.value = ''; // Reset file input
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-center bg-black">
            {isLoading && <Loader />}
            <div className="w-full max-w-4xl h-full flex flex-col bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl animate-fade-in">
                <div className="flex-shrink-0 p-6 flex justify-between items-center border-b border-slate-700">
                    <div>
                        <h1 className="text-3xl text-amber-300 font-bold">Danh Sách Lưu Trữ (Local)</h1>
                        <p className="text-slate-400 text-sm mt-1">Trò chơi sẽ tự động lưu vào bộ nhớ cục bộ của trình duyệt. Dưới đây là các bản lưu của bạn.</p>
                    </div>
                    <button onClick={onBackToMenu} className="text-slate-400 hover:text-white transition-colors" aria-label="Quay lại Menu">
                         &larr; Quay lại Menu
                    </button>
                </div>

                <div className="flex-grow p-6 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                    {saves.length > 0 ? (
                        saves.map(save => (
                            <div key={save.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex flex-col md:flex-row items-center gap-4 text-left">
                                <div className="flex-grow">
                                    <h2 className="text-xl font-bold text-slate-100">{save.name}</h2>
                                    <p className="text-sm text-slate-400">
                                        Lần cuối lưu: {new Date(save.lastSaved).toLocaleString('vi-VN')} | Dung lượng: {formatBytes(save.size)}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-2">
                                    <button onClick={() => handleLoad(save.id)} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors">Tải Game</button>
                                    <button onClick={() => handleExport(save.id)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors">Xuất File</button>
                                    <button onClick={() => handleDelete(save.id)} className="px-4 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors">Xóa Lưu</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        !isLoading && <p className="text-slate-500 text-center py-10">Không có bản lưu nào.</p>
                    )}
                    {error && <p className="text-red-400 text-center">{error}</p>}
                </div>

                <div className="flex-shrink-0 p-6 border-t border-slate-700 bg-slate-900/50">
                     <h2 className="text-xl font-bold text-slate-100">Tải từ File (Local)</h2>
                     <p className="text-slate-400 text-sm mt-1 mb-4">Bạn có thể tải lên một file lưu (.json) từ máy tính của mình. Thao tác này sẽ tạo một bản lưu mới trong danh sách.</p>
                     <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept="application/json" />
                     <button onClick={handleImportClick} className="w-full p-4 bg-purple-700 text-white font-bold text-lg rounded-lg hover:bg-purple-600 transition-colors">
                        Nhập File Lưu (.json)
                    </button>
                </div>
            </div>
        </div>
    );
};