
import React from 'react';

interface CollapsibleSectionProps {
    title: React.ReactNode;
    count?: number;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, count, isOpen, onToggle, children }) => {
    return (
        <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 transition-all duration-300">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex justify-between items-center p-4 text-left"
                aria-expanded={isOpen}
            >
                <h2 className="text-xl font-semibold text-amber-300">
                    {title} {count !== undefined && <span className="text-base text-slate-400 font-normal">({count})</span>}
                </h2>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 animate-fade-in">
                    <div className="border-t border-slate-700/50 pt-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};