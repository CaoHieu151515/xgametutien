import React, { useState, useMemo } from 'react';
import { CharacterProfile, NPC, StatusEffect } from '../../types';
import { TimeIcon } from '../ui/Icons';

interface TimeSkipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTimeSkip: (turns: number) => void;
    characterProfile: CharacterProfile;
    npcs: NPC[];
}

const parseTurnDuration = (duration: string): number | null => {
    const match = duration.match(/(\d+)\s*lượt/i);
    return match ? parseInt(match[1], 10) : null;
};

const turnsToTime = (turns: number): string => {
    if (turns <= 0) return 'Tức thì';
    // 1 ngày = 3 lượt => 1 lượt = 8 giờ
    const totalHours = turns * 8;
    if (totalHours < 24) return `${totalHours} giờ`;
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    return `${days} ngày` + (remainingHours > 0 ? ` ${remainingHours} giờ` : '');
};

export const TimeSkipModal: React.FC<TimeSkipModalProps> = ({ isOpen, onClose, onTimeSkip, characterProfile, npcs }) => {
    const [durationValue, setDurationValue] = useState(1);
    const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours' | 'days'>('days');

    const skippableEvents = useMemo(() => {
        const events: { ownerName: string; effectName: string; turns: number }[] = [];
        
        // Player events
        characterProfile.statusEffects.forEach(effect => {
            const turns = parseTurnDuration(effect.duration);
            if (turns) {
                events.push({ ownerName: 'Bạn', effectName: effect.name, turns });
            }
        });

        // NPC events
        npcs.forEach(npc => {
            if (npc.isDead) return;
            npc.statusEffects.forEach(effect => {
                const turns = parseTurnDuration(effect.duration);
                if (turns) {
                    events.push({ ownerName: npc.name, effectName: effect.name, turns });
                }
            });
        });

        return events.sort((a, b) => a.turns - b.turns);
    }, [characterProfile, npcs]);

    const handleSkip = (turns: number) => {
        onTimeSkip(turns);
        onClose();
    };

    const handleCustomSkip = () => {
        let totalMinutes = 0;
        switch (durationUnit) {
            case 'minutes': totalMinutes = durationValue; break;
            case 'hours': totalMinutes = durationValue * 60; break;
            case 'days': totalMinutes = durationValue * 24 * 60; break;
        }
        // 1 lượt = 8 giờ = 480 phút
        const turns = Math.max(1, Math.round(totalMinutes / 480));
        handleSkip(turns);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 px-6 py-4 flex justify-between items-center border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-amber-300 flex items-center gap-3"><TimeIcon /> Dòng Chảy Thời Gian</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Đóng"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>

                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-slate-100 mb-3">Tua nhanh đến Sự kiện</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                            {skippableEvents.length > 0 ? (
                                skippableEvents.map((event, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => handleSkip(event.turns)}
                                        className="w-full flex justify-between items-center p-3 text-left rounded-lg bg-slate-800/70 hover:bg-slate-700 transition-colors"
                                    >
                                        <div>
                                            <p className="font-semibold text-amber-300 text-sm">{event.effectName}</p>
                                            <p className="text-xs text-slate-400">của {event.ownerName}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                             <p className="font-bold text-slate-200 text-sm">{event.turns} lượt</p>
                                            <p className="text-xs text-slate-500">{turnsToTime(event.turns)}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-slate-500 text-center py-4">Không có sự kiện nào có thể tua nhanh đến.</p>
                            )}
                        </div>
                    </div>

                     <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-slate-100 mb-3">Tua nhanh theo Khoảng thời gian</h3>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={durationValue}
                                onChange={e => setDurationValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                min="1"
                                className="w-1/3 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <select
                                value={durationUnit}
                                onChange={e => setDurationUnit(e.target.value as any)}
                                className="w-1/3 p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}
                            >
                                <option value="minutes">Phút</option>
                                <option value="hours">Giờ</option>
                                <option value="days">Ngày</option>
                            </select>
                            <button
                                onClick={handleCustomSkip}
                                className="w-1/3 p-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors"
                            >
                                Bắt đầu
                            </button>
                        </div>
                    </div>
                     <div className="text-center p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                        <p className="text-yellow-300 text-sm font-semibold">Cảnh báo</p>
                        <p className="text-slate-400 text-xs mt-1">Trong khi thời gian trôi qua, thế giới vẫn tiếp tục vận động. Các NPC có thể tự tu luyện, di chuyển, và các sự kiện bất ngờ có thể xảy ra.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};