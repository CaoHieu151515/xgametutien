
import React from 'react';
import { StatusEffect, CharacterGender } from '../../../../types';
import { getExperienceForNextLevel, getSkillExperienceForNextLevel } from '../../../../services/progressionService';

export const NewBadge = () => <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 bg-yellow-300 rounded-full">NEW</span>;

export const AccordionItem = ({ title, name, description }: { title: string, name: string, description: string }) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const hasContent = (name && name.toLowerCase() !== 'null') || (description && description.toLowerCase() !== 'null');

    return (
        <div className="border-t border-slate-700/50 pt-4">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center text-left text-base font-semibold text-slate-200 hover:text-amber-300 transition-colors"
            >
                <span>{title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                 <div className="mt-2 bg-slate-800/50 p-3 rounded-lg animate-fade-in">
                    {hasContent ? (
                        <>
                            {(name && name.toLowerCase() !== 'null') && <p className="text-amber-300 font-bold">{name}</p>}
                            {(description && description.toLowerCase() !== 'null') && <p className="text-slate-300 whitespace-pre-wrap mt-1 text-sm">{description}</p>}
                        </>
                    ) : (
                        <p className="text-slate-400 italic">Chưa rõ</p>
                    )}
                 </div>
            )}
        </div>
    );
};

export const HealthBar = ({ value, maxValue }: { value: number; maxValue: number; }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-slate-300 font-medium">Sinh Lực</span>
                <span className="font-semibold text-red-400">{Math.round(value)} / {maxValue}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-red-600 to-red-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

export const ManaBar = ({ value, maxValue }: { value: number; maxValue: number; }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-slate-300 font-medium">Linh Lực</span>
                <span className="font-semibold text-blue-400">{Math.round(value)} / {maxValue}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

export const ExperienceBar = ({ value, level }: { value: number, level: number }) => {
    const requiredXp = getExperienceForNextLevel(level);
    const percentage = requiredXp > 0 ? (value / requiredXp) * 100 : 0;
    return (
        <div>
             <div className="flex justify-between items-baseline mb-1">
                <span className="text-slate-300 font-medium">Kinh Nghiệm</span>
                <span className="font-semibold text-green-400">{Math.round(value)} / {requiredXp} EXP</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

export const SkillExperienceBar = ({ value, level, quality, qualityTiersString }: { value: number; level: number; quality: string; qualityTiersString: string }) => {
    const requiredXp = getSkillExperienceForNextLevel(level, quality, qualityTiersString);
    const percentage = (level === 10 && value >= requiredXp) ? 100 : (requiredXp > 0 ? (value / requiredXp) * 100 : 0);
    const displayValue = Math.min(value, requiredXp);

    return (
        <div>
            <div className="flex justify-between items-baseline text-xs mb-1">
                <span className="text-slate-400 font-medium">Kinh Nghiệm Kỹ Năng</span>
                <span className="font-semibold text-amber-400">{Math.round(displayValue)} / {requiredXp} EXP</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-amber-600 to-yellow-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


export type StatusEffectType = 'positive' | 'negative' | 'special';

export const getStatusEffectType = (effect: StatusEffect): StatusEffectType => {
    const name = effect.name.toLowerCase();
    const specialKeywords = ['trang bị:', 'huyết mạch', 'long phượng', 'khuyển nô', 'thân thể', 'sáng thế', 'bị khóa', 'bị thiến', 'mang thai'];
    if (specialKeywords.some(kw => name.includes(kw))) {
        return 'special';
    }
    const negativeKeywords = ['độc', 'suy yếu', 'giảm', 'trúng', 'thương', 'bỏng', 'tê liệt', 'choáng', 'hỗn loạn', 'mất', 'trừ', 'nguyền', 'trói', 'phế', 'trọng thương', 'suy nhược'];
    if (negativeKeywords.some(kw => name.includes(kw))) {
        return 'negative';
    }
    return 'positive';
};

export const statusStyles: Record<StatusEffectType, { border: string; bg: string; text: string; }> = {
    positive: { border: 'border-green-500/30', bg: 'bg-green-900/30', text: 'text-green-300' },
    negative: { border: 'border-red-500/30', bg: 'bg-red-900/30', text: 'text-red-400' },
    special: { border: 'border-purple-500/30', bg: 'bg-purple-900/30', text: 'text-purple-300' }
};

export const getDefaultAvatar = (gender: CharacterGender) => {
    return gender === CharacterGender.MALE ? 'https://i.imgur.com/9CXRf64.png' : 'https://i.imgur.com/K8Z3w4q.png';
};
