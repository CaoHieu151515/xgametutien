import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Location, LocationType, CharacterProfile, WorldSettings, Choice } from '../../types';

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
    locations: Location[];
    currentLocationId: string | null;
    characterProfile: CharacterProfile;
    onAction: (choice: Choice) => void;
    onUpdateLocation: (location: Location) => void;
    isLoading: boolean;
    worldSettings: WorldSettings; // Thêm props này
}

const NewBadge = () => <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 bg-yellow-300 rounded-full">NEW</span>;

const locationTypeDetails: Record<LocationType, { icon: string; color: string; name: string }> = {
    [LocationType.WORLD]: { icon: '🌍', color: 'text-cyan-300', name: 'Thế Giới' },
    [LocationType.CITY]: { icon: '🏙️', color: 'text-slate-300', name: 'Thành Trấn' },
    [LocationType.THE_LUC]: { icon: '🚩', color: 'text-purple-400', name: 'Thế Lực' },
    [LocationType.TOWN]: { icon: '🏡', color: 'text-green-400', name: 'Thôn Làng' },
    [LocationType.FOREST]: { icon: '🌳', color: 'text-lime-400', name: 'Rừng Rậm' },
    [LocationType.DUNGEON]: { icon: '⚔️', color: 'text-red-400', name: 'Bí Cảnh' },
    [LocationType.SHOP]: { icon: '🛍️', color: 'text-yellow-400', name: 'Cửa Hàng' },
    [LocationType.INN]: { icon: '🏨', color: 'text-amber-400', name: 'Nhà Trọ' },
    [LocationType.RESTAURANT]: { icon: '🍽️', color: 'text-orange-400', name: 'Tửu Lâu' },
};

const LocationPin: React.FC<{
    location: Location;
    isCurrent: boolean;
    isSelected: boolean;
    isDestroyed: boolean;
    isEditing: boolean;
    isDragged: boolean;
    onClick: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
}> = ({ location, isCurrent, isSelected, isDestroyed, isEditing, isDragged, onClick, onMouseDown }) => {
    const details = locationTypeDetails[location.type] || { icon: '📍', color: 'text-white' };
    const pinSize = location.type === LocationType.WORLD ? 'text-3xl' : 'text-2xl';
    const selectedClass = isSelected ? 'scale-150' : 'group-hover:scale-125';
    const destroyedClass = isDestroyed ? 'opacity-30 grayscale' : '';
    const editingClass = isEditing && !isDestroyed ? (isDragged ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-pointer';

    return (
        <div
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center justify-center z-10 ${destroyedClass} ${editingClass}`}
            style={{ left: `${location.coordinates.x / 10}%`, top: `${location.coordinates.y / 10}%` }}
            onClick={onClick}
            onMouseDown={onMouseDown}
        >
            <div className={`relative flex items-center justify-center transition-transform duration-300 ${selectedClass}`}>
                 {isCurrent && !isDestroyed && (
                    <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping"></div>
                )}
                <span className={`relative z-10 drop-shadow-lg ${pinSize}`}>{isDestroyed ? '💥' : details.icon}</span>
            </div>
            <div className={`mt-1 text-center w-max max-w-xs px-2 py-0.5 bg-slate-900/70 rounded-md text-xs pointer-events-none z-20 ${isDestroyed ? 'text-red-500' : 'text-white'}`}>
                {location.name} {location.isNew ? '(Mới)' : ''} {isDestroyed ? '(Đã Hủy Diệt)' : ''}
            </div>
        </div>
    );
};

const Breadcrumb: React.FC<{
    path: Location[];
    onNavigate: (index: number) => void;
}> = ({ path, onNavigate }) => {
    return (
        <nav className="flex items-center text-sm text-slate-400 flex-wrap flex-grow min-w-0">
            <button onClick={() => onNavigate(-1)} className="hover:text-amber-300 hover:underline flex-shrink-0">
                Bản Đồ Thế Giới
            </button>
            {path.map((loc, index) => (
                <React.Fragment key={loc.id}>
                    <span className="mx-2 flex-shrink-0">/</span>
                    <button
                        onClick={() => onNavigate(index)}
                        className={`hover:text-amber-300 hover:underline truncate ${
                            index === path.length - 1 ? 'text-amber-300 font-semibold' : ''
                        }`}
                        title={loc.name}
                    >
                        {loc.name}
                    </button>
                </React.Fragment>
            ))}
        </nav>
    );
};

const RulesEditor: React.FC<{ 
    location: Location; 
    onUpdateLocation: (location: Location) => void;
    title?: string;
}> = ({ location, onUpdateLocation, title }) => {
    const [newRule, setNewRule] = useState('');

    const handleAddRule = () => {
        if (newRule.trim()) {
            const updatedRules = [...(location.rules || []), newRule.trim()];
            onUpdateLocation({ ...location, rules: updatedRules });
            setNewRule('');
        }
    };

    const handleDeleteRule = (indexToDelete: number) => {
        const updatedRules = (location.rules || []).filter((_, index) => index !== indexToDelete);
        onUpdateLocation({ ...location, rules: updatedRules });
    };

    return (
        <div className="mt-4 border-t border-slate-700 pt-4 space-y-3">
            <h5 className="font-semibold text-amber-200">{title || 'Quản Lý Luật Lệ'}</h5>
            <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pr-2">
                {(location.rules || []).length > 0 ? (
                    (location.rules || []).map((rule, index) => (
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
                    placeholder="Thêm luật lệ mới..."
                    className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-slate-200 text-sm"
                />
                <button onClick={handleAddRule} disabled={!newRule.trim()} className="px-4 bg-amber-600 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors text-sm disabled:opacity-50">Thêm</button>
            </div>
        </div>
    );
};

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, locations, currentLocationId, characterProfile, onAction, onUpdateLocation, isLoading, worldSettings }) => {
    const [path, setPath] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableLocations, setEditableLocations] = useState<Location[]>([]);
    const [draggedLocationId, setDraggedLocationId] = useState<string | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    const locationMap = useMemo(() => new Map(locations.map(loc => [loc.id, loc])), [locations]);

    const isLocationOrAncestorDestroyed = useCallback((loc: Location | null): boolean => {
        if (!loc) return false;
        let current: Location | undefined = loc;
        while (current) {
            if (current.isDestroyed) return true;
            current = current.parentId ? locationMap.get(current.parentId) : undefined;
        }
        return false;
    }, [locationMap]);

    const centerMapOnLocation = useCallback((location: Location | null, behavior: 'smooth' | 'auto' = 'smooth') => {
        if (location && mapContainerRef.current && mapRef.current) {
            const container = mapContainerRef.current;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            const targetX = (location.coordinates.x / 1000) * mapRef.current.offsetWidth;
            const targetY = (location.coordinates.y / 1000) * mapRef.current.offsetHeight;

            container.scrollTo({
                left: targetX - containerWidth / 2,
                top: targetY - containerHeight / 2,
                behavior: behavior,
            });
        }
    }, []);
    
    useEffect(() => {
        if (isOpen) {
            const getAncestorPath = (locId: string | null): Location[] => {
                if (!locId) return [];
                const path: Location[] = [];
                let current = locationMap.get(locId);
                if (!current) return [];
    
                let parentId = current.parentId;
                while (parentId) {
                    const parent = locationMap.get(parentId);
                    if (parent) {
                        path.unshift(parent);
                        parentId = parent.parentId;
                    } else {
                        break;
                    }
                }
                return path;
            };
            
            const currentLoc = locations.find(l => l.id === currentLocationId);
            let initialPath: Location[] = [];
    
            if (currentLoc) {
                if (currentLoc.type === LocationType.WORLD) {
                    initialPath = [currentLoc];
                } else {
                    initialPath = getAncestorPath(currentLocationId);
                }
            }
            
            setPath(initialPath);
            setSelectedLocation(currentLoc || null);
            
            setTimeout(() => centerMapOnLocation(currentLoc, 'auto'), 150);
        } else {
            setPath([]);
            setSelectedLocation(null);
            setIsEditing(false);
        }
    }, [isOpen, currentLocationId, locations, locationMap, centerMapOnLocation]);

    const currentParentId = useMemo(() => path.length > 0 ? path[path.length - 1].id : null, [path]);
    
    const locationsToList = useMemo(() => {
        const list = currentParentId === null
            ? locations.filter(loc => loc.type === LocationType.WORLD)
            : locations.filter(loc => loc.parentId === currentParentId);
        return list.sort((a,b) => a.name.localeCompare(b.name));
    }, [locations, currentParentId]);
    
    const locationsToRenderOnMap = isEditing ? editableLocations : locationsToList;

    const handleNavigatePath = (index: number) => { setPath(prev => prev.slice(0, index + 1)); setSelectedLocation(null); };
    const handleSelectLocationFromList = (location: Location) => { setSelectedLocation(location); centerMapOnLocation(location, 'smooth'); };
    const handleViewContents = () => {
        if (selectedLocation) {
            setPath(prev => [...prev, selectedLocation]);
            setSelectedLocation(null);
        }
    };

    const handleMoveTo = () => {
        if (!selectedLocation || isLoading) return;
        const moveChoice: Choice = { title: `Di chuyển đến ${selectedLocation.name}`, benefit: 'Khám phá khu vực mới.', risk: 'Có thể gặp nguy hiểm trên đường đi.', successChance: 100, durationInMinutes: 30 };
        onAction(moveChoice);
        onClose();
    };

    const hasChildren = useMemo(() => selectedLocation ? locations.some(loc => loc.parentId === selectedLocation.id) : false, [selectedLocation, locations]);
    const isSelectedLocationDestroyed = isLocationOrAncestorDestroyed(selectedLocation);
    const isOwner = selectedLocation?.ownerId === characterProfile.id;

    // --- Edit Mode Logic ---
    const handleStartEditing = () => {
        setEditableLocations(JSON.parse(JSON.stringify(locationsToList)));
        setIsEditing(true);
        setSelectedLocation(null);
    };

    const handleCancelEditing = () => setIsEditing(false);

    const handleSaveChanges = () => {
        const originalMap = new Map(locationsToList.map(l => [l.id, l.coordinates]));
        editableLocations.forEach(editedLoc => {
            const originalCoords = originalMap.get(editedLoc.id);
            if (originalCoords && (originalCoords.x !== editedLoc.coordinates.x || originalCoords.y !== editedLoc.coordinates.y)) {
                onUpdateLocation(editedLoc);
            }
        });
        setIsEditing(false);
    };

    const handlePinMouseDown = (e: React.MouseEvent, locationId: string) => {
        if (!isEditing) return;
        e.preventDefault();
        setDraggedLocationId(locationId);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!draggedLocationId || !mapRef.current || !mapContainerRef.current) return;

            const mapRect = mapRef.current.getBoundingClientRect();
            const container = mapContainerRef.current;
            
            const mouseX = e.clientX - mapRect.left + container.scrollLeft;
            const mouseY = e.clientY - mapRect.top + container.scrollTop;

            let newX = Math.round((mouseX / mapRef.current.offsetWidth) * 1000);
            let newY = Math.round((mouseY / mapRef.current.offsetHeight) * 1000);

            newX = Math.max(10, Math.min(990, newX)); // Clamp to avoid pins being on the very edge
            newY = Math.max(10, Math.min(990, newY));

            setEditableLocations(prev =>
                prev.map(loc =>
                    loc.id === draggedLocationId
                        ? { ...loc, coordinates: { x: newX, y: newY } }
                        : loc
                )
            );
        };

        const handleMouseUp = () => setDraggedLocationId(null);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggedLocationId, isEditing]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="map-title">
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-7xl m-4 flex flex-col max-h-[90vh] h-[90vh]" onClick={(e) => e.stopPropagation()}>
                 <div className="flex-shrink-0 px-6 py-4 flex justify-between items-center border-b border-slate-700">
                    <h2 id="map-title" className="text-xl font-bold text-amber-300">Bản Đồ</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Đóng"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    <div className="w-full md:w-80 lg:w-96 flex-shrink-0 h-1/2 md:h-full bg-slate-900/30 p-4 overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="flex justify-between items-center gap-2 mb-4">
                            <Breadcrumb path={path} onNavigate={handleNavigatePath} />
                            <div className="flex-shrink-0">
                                {!isEditing ? (
                                    <button onClick={handleStartEditing} className="px-3 py-1.5 bg-slate-600 text-slate-200 text-xs font-semibold rounded-md hover:bg-slate-500 transition-colors">Sửa Vị Trí</button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveChanges} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-500 transition-colors">Lưu</button>
                                        <button onClick={handleCancelEditing} className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded-md hover:bg-slate-600 transition-colors">Hủy</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {isEditing ? (
                             <div className="flex-grow flex items-center justify-center text-center p-4 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-600">
                                <p className="text-slate-400">Chế độ chỉnh sửa đang bật. Kéo và thả các địa điểm trên bản đồ để thay đổi vị trí của chúng.</p>
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col">
                                {selectedLocation ? (
                                    <div className="animate-fade-in flex-grow flex flex-col">
                                        <div className="flex-grow">
                                            <button onClick={() => setSelectedLocation(null)} className="text-sm text-slate-400 hover:text-white mb-4">&larr; Quay lại danh sách</button>
                                            <h4 className={`text-xl font-bold break-words flex items-center ${isSelectedLocationDestroyed ? 'text-red-500 line-through' : 'text-amber-300'}`}>{selectedLocation.name}{selectedLocation.isNew && <NewBadge/>}</h4>
                                            <div className="mt-2 mb-4 flex items-center gap-2"><span className="text-lg">{isSelectedLocationDestroyed ? '💥' : (locationTypeDetails[selectedLocation.type]?.icon)}</span><span className={`font-semibold ${isSelectedLocationDestroyed ? 'text-red-400' : locationTypeDetails[selectedLocation.type]?.color}`}>{isSelectedLocationDestroyed ? 'Đã Hủy Diệt' : (locationTypeDetails[selectedLocation.type]?.name || selectedLocation.type)}</span></div>
                                            <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">{selectedLocation.description}</div>
                                            {isOwner && !isSelectedLocationDestroyed && <RulesEditor location={selectedLocation} onUpdateLocation={onUpdateLocation} />}
                                        </div>
                                        <div className="mt-6 flex-shrink-0 space-y-3">
                                            {isOwner && !isSelectedLocationDestroyed && (<div className="p-3 bg-yellow-900/50 border border-yellow-500/50 rounded-lg text-center"><p className="font-bold text-yellow-300">Bạn là chủ sở hữu</p></div>)}
                                            {selectedLocation.id === currentLocationId ? (<div className="p-3 bg-green-900/50 border border-green-500/50 rounded-lg text-center"><p className="font-bold text-green-300">Bạn đang ở đây</p></div>) : (<button onClick={handleMoveTo} disabled={isLoading || isSelectedLocationDestroyed} className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isSelectedLocationDestroyed ? 'Không thể di chuyển' : 'Di chuyển tới'}</button>)}
                                            {hasChildren && !isSelectedLocationDestroyed && (<button onClick={handleViewContents} className="w-full p-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors">Xem các địa điểm bên trong &rarr;</button>)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-grow space-y-1">
                                        {locationsToList.length > 0 ? locationsToList.map(loc => {
                                            const details = locationTypeDetails[loc.type] || { icon: '?', name: loc.type };
                                            const isDestroyed = isLocationOrAncestorDestroyed(loc);
                                            return (
                                                <button key={loc.id} onClick={() => handleSelectLocationFromList(loc)} className={`w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-slate-700/50 transition-colors ${isDestroyed ? 'opacity-50' : ''}`}><span className="text-xl">{isDestroyed ? '💥' : details.icon}</span><div className="flex-grow"><p className={`font-semibold flex items-center ${isDestroyed ? 'text-red-500 line-through' : 'text-slate-200'}`}>{loc.name}{loc.isNew && <NewBadge />}</p><p className="text-xs text-slate-400">{isDestroyed ? 'Đã Hủy Diệt' : details.name}</p></div><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
                                            );
                                        }) : (<p className="text-slate-500 text-center py-8">Không có địa điểm con nào ở đây.</p>)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div ref={mapContainerRef} className="flex-grow overflow-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 relative bg-slate-900">
                        <div ref={mapRef} className={`relative w-[1000px] h-[1000px] bg-slate-900 m-4 border-2 border-slate-700 bg-grid ${draggedLocationId ? 'cursor-grabbing' : ''}`}>
                           {locationsToRenderOnMap.map(loc => (
                               <LocationPin
                                   key={loc.id}
                                   location={loc}
                                   isCurrent={loc.id === currentLocationId}
                                   isSelected={loc.id === selectedLocation?.id}
                                   isDestroyed={isLocationOrAncestorDestroyed(loc)}
                                   isEditing={isEditing}
                                   isDragged={draggedLocationId === loc.id}
                                   onClick={() => !isEditing && handleSelectLocationFromList(loc)}
                                   onMouseDown={(e) => handlePinMouseDown(e, loc.id)}
                               />
                           ))}
                           <style>{`.bg-grid { background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px; }`}</style>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};