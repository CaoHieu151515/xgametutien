
import React from 'react';
import { Choice } from '../types';

interface AdventureCardProps {
  choice: Choice;
  onClick: () => void;
  disabled: boolean;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 001 1h.01a1 1 0 100-2H10a1 1 0 00-1 1z" clipRule="evenodd" />
    </svg>
);

const formatDuration = (minutes: number) => {
    if (minutes <= 0) return 'Tức thì';
    if (minutes < 60) return `${minutes} phút`;
    if (minutes < 1440) { // Less than a day
         const hours = Math.floor(minutes / 60);
         const remainingMinutes = minutes % 60;
         return `${hours} giờ` + (remainingMinutes > 0 ? ` ${remainingMinutes} phút` : '');
    }
    const days = Math.floor(minutes / 1440);
    return `${days} ngày`;
}

export const AdventureCard: React.FC<AdventureCardProps> = ({ choice, onClick, disabled }) => {
    const { title, benefit, risk, successChance, durationInMinutes } = choice;
    const chanceColor = successChance >= 70 ? 'text-green-400' : successChance >= 40 ? 'text-yellow-400' : 'text-red-400';
    const chanceBgColorClass = successChance >= 70 ? 'bg-green-500/20 border-green-500' : successChance >= 40 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-red-500/20 border-red-500';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full text-left p-2 bg-slate-800/70 border border-slate-700 rounded-lg hover:bg-slate-700/70 hover:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/70 flex flex-col justify-between"
        >
            <div>
                <div className="flex justify-between items-start mb-1.5">
                    <h3 className="font-bold text-sm text-slate-100 pr-2">{title}</h3>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 ${chanceBgColorClass} flex items-center justify-center`}>
                        <span className={`font-bold text-xs ${chanceColor}`}>{successChance}%</span>
                    </div>
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex items-start gap-1.5">
                        <CheckIcon />
                        <p className="text-slate-300"><span className="font-semibold text-green-400">Lợi ích:</span> {benefit}</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                        <WarningIcon />
                        <p className="text-slate-300"><span className="font-semibold text-red-400">Rủi ro:</span> {risk}</p>
                    </div>
                </div>
            </div>
            <div className="text-right text-xs text-slate-400 font-semibold mt-1.5 border-t border-slate-700/50 pt-1.5">
                {formatDuration(durationInMinutes)}
            </div>
        </button>
    );
};
