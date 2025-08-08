import React from 'react';

interface MatureContentToggleProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}

export const MatureContentToggle: React.FC<MatureContentToggleProps> = ({ isChecked, onChange, disabled }) => {
  return (
    <div className="w-full max-w-sm mt-8 text-left">
      <label htmlFor="mature-toggle" className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            id="mature-toggle"
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
          <div className={`block w-14 h-8 rounded-full transition-colors ${isChecked ? 'bg-red-800' : 'bg-slate-700'}`}></div>
          <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isChecked ? 'transform translate-x-6' : ''}`}></div>
        </div>
        <div className="ml-4 text-slate-300">
          <span className="font-semibold">Bật nội dung người lớn (18+)</span>
        </div>
      </label>
      <p className="text-xs text-slate-500 mt-2 ml-1">
        Cảnh báo: Có thể chứa các cảnh bạo lực và tình dục chi tiết.
      </p>
    </div>
  );
};
