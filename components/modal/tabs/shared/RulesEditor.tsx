import React, { useState } from 'react';

interface RulesEditorProps {
    rules: string[];
    onUpdateRules: (newRules: string[]) => void;
    title?: string;
    description?: string;
    placeholder?: string;
}

export const RulesEditor: React.FC<RulesEditorProps> = ({ rules, onUpdateRules, title, description, placeholder }) => {
    const [newRule, setNewRule] = useState('');

    const handleAddRule = () => {
        if (newRule.trim()) {
            const updatedRules = [...rules, newRule.trim()];
            onUpdateRules(updatedRules);
            setNewRule('');
        }
    };

    const handleDeleteRule = (indexToDelete: number) => {
        const updatedRules = rules.filter((_, index) => index !== indexToDelete);
        onUpdateRules(updatedRules);
    };

    return (
        <div className="border-t border-slate-700 pt-4 space-y-3">
            <h5 className="font-semibold text-amber-200">{title || 'Quản Lý Luật Lệ'}</h5>
            {description && <p className="text-xs text-slate-400">{description}</p>}
            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                {rules.length > 0 ? (
                    rules.map((rule, index) => (
                        <div key={index} className="flex items-start justify-between p-2 bg-slate-800/50 rounded-md text-slate-300 text-sm">
                            <p className="flex-grow pr-2">&bull; {rule}</p>
                            <button onClick={() => handleDeleteRule(index)} className="flex-shrink-0 text-red-500 hover:text-red-400 font-bold text-lg transition-colors" aria-label={`Xóa quy tắc: ${rule}`}>&times;</button>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-center py-2 text-sm">Chưa có luật lệ nào được định nghĩa.</p>
                )}
            </div>
             <div className="flex gap-2">
                <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder={placeholder || "Thêm luật lệ mới..."}
                    className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200 text-sm"
                />
                <button onClick={handleAddRule} disabled={!newRule.trim()} className="px-4 bg-amber-600 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors text-sm disabled:opacity-50">Thêm</button>
            </div>
        </div>
    );
};