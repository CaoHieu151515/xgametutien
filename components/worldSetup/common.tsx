

import React from 'react';
import { RemoveIcon, WandIcon } from '../ui/Icons';

export const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200 disabled:bg-slate-700/50" />
);

export const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200 appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}/>
);

export const FormTextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} rows={props.rows || 3} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200 resize-y" />
);

export const FormLabel = ({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300 mb-1">{children}</label>
);

export { RemoveIcon, WandIcon };


export const TabButton = ({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none ${
            isActive 
                ? 'border-b-2 border-amber-400 text-amber-300' 
                : 'text-slate-400 hover:text-slate-200'
        }`}
    >
        {children}
    </button>
);