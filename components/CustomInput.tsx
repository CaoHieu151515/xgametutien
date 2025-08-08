import React, { useState } from 'react';

interface CustomInputProps {
  onSubmit: (action: string) => void;
  disabled: boolean;
}

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
);


export const CustomInput: React.FC<CustomInputProps> = ({ onSubmit, disabled }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder="Hoặc tự viết hành động của bạn..."
        className="w-full p-4 pl-4 pr-12 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors duration-300 disabled:opacity-50"
      />
       <button 
        type="submit" 
        disabled={disabled || !value.trim()}
        className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-400 hover:text-amber-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
      >
        <ArrowRightIcon/>
      </button>
    </form>
  );
};