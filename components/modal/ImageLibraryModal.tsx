
import React, { useState, useEffect, useMemo } from 'react';

interface AvatarData {
    url: string;
    type: 'character' | 'monster' | 'pet';
    gender: 'male' | 'female' | 'none';
    tags: string[];
}

interface ImageLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200 appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}/>
);


export const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [avatars, setAvatars] = useState<AvatarData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetch('/generated_avatar_data.json')
                .then(res => res.json())
                .then(data => {
                    setAvatars(data);
                })
                .catch(err => console.error("Could not load avatar data", err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen]);

    const filteredAvatars = useMemo(() => {
        return avatars.filter(avatar => {
            const typeMatch = typeFilter === 'all' || avatar.type === typeFilter;
            const genderMatch = genderFilter === 'all' || avatar.gender === genderFilter;
            const searchMatch = !searchTerm.trim() || avatar.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase().trim()));
            return typeMatch && genderMatch && searchMatch;
        });
    }, [avatars, searchTerm, typeFilter, genderFilter]);
    
    const handleSelect = (url: string) => {
        onSelect(url);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex-shrink-0 px-6 py-4 flex justify-between items-center border-b border-slate-700">
                    <h2 className="text-xl font-bold text-slate-100">Thư Viện Ảnh Đại Diện</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close library">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-shrink-0 p-4 border-b border-slate-700 flex flex-wrap gap-4 items-end">
                    <div className="flex-grow">
                        <label className="text-sm text-slate-400 mb-1 block">Tìm kiếm theo tag</label>
                        <input type="text" placeholder="Vd: kiếm sĩ, lạnh lùng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Loại</label>
                        <FormSelect value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                            <option value="all">Tất cả</option>
                            <option value="character">Nhân Vật</option>
                            <option value="monster">Quái Vật</option>
                            <option value="pet">Linh Thú</option>
                        </FormSelect>
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Giới tính</label>
                        <FormSelect value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
                            <option value="all">Tất cả</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="none">Khác</option>
                        </FormSelect>
                    </div>
                </div>
                <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="w-12 h-12 border-4 border-slate-600 border-t-amber-400 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredAvatars.map(avatar => (
                                <button key={avatar.url} onClick={() => handleSelect(avatar.url)} className="aspect-square bg-slate-700 rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-amber-400">
                                    <img src={avatar.url} alt={avatar.tags.join(', ')} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" onError={(e) => { e.currentTarget.src = 'https://i.imgur.com/pBwB4aB.png'; }} />
                                </button>
                            ))}
                            {filteredAvatars.length === 0 && <p className="col-span-full text-center text-slate-500 py-10">Không tìm thấy ảnh phù hợp.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};