
import React from 'react';
import { CharacterProfile, Location, LocationType, Coordinates } from '../../../types';
import { FormInput, FormSelect, FormTextArea, FormLabel, RemoveIcon } from '../common';

interface InitialLocationsSectionProps {
    profile: CharacterProfile;
    setProfile: React.Dispatch<React.SetStateAction<CharacterProfile>>;
}

export const InitialLocationsSection: React.FC<InitialLocationsSectionProps> = ({ profile, setProfile }) => {
    const handleAddInitialLocation = () => {
        const existingCoordinates = (profile.initialLocations || []).map(loc => loc.coordinates);
        let newCoordinates: Coordinates = { x: 500, y: 500 };

        if (existingCoordinates.length > 0) {
            let isOverlapping = true;
            let attempts = 0;
            const minDistance = 75;

            while (isOverlapping && attempts < 100) {
                const potentialX = Math.floor(Math.random() * 900) + 50;
                const potentialY = Math.floor(Math.random() * 900) + 50;

                isOverlapping = existingCoordinates.some(coord => 
                    Math.sqrt(Math.pow(coord.x - potentialX, 2) + Math.pow(coord.y - potentialY, 2)) < minDistance
                );

                if (!isOverlapping) newCoordinates = { x: potentialX, y: potentialY };
                attempts++;
            }
            if (isOverlapping) newCoordinates = { x: Math.floor(Math.random() * 900) + 50, y: Math.floor(Math.random() * 900) + 50 };
        }

        const newLocation: Location = { id: `loc_initial_${Date.now()}`, name: '', description: '', type: LocationType.TOWN, coordinates: newCoordinates, parentId: null, ownerId: null, rules: [] };
        setProfile(prev => ({ ...prev, initialLocations: [...(prev.initialLocations || []), newLocation] }));
    };

    const handleRemoveInitialLocation = (idToRemove: string) => {
        setProfile(prev => ({
            ...prev,
            initialLocations: (prev.initialLocations || []).filter(loc => loc.id !== idToRemove),
            initialNpcs: (prev.initialNpcs || []).map(npc => npc.locationId === idToRemove ? { ...npc, locationId: '' } : npc),
        }));
    };

    const handleUpdateInitialLocation = (id: string, field: keyof Location, value: any) => {
        setProfile(prev => ({
            ...prev,
            initialLocations: (prev.initialLocations || []).map(loc => {
                if (loc.id === id) {
                    const updatedLoc = { ...loc, [field]: value };
                    if (field === 'type' && value === LocationType.WORLD) updatedLoc.parentId = null;
                    return updatedLoc;
                }
                return loc;
            }),
        }));
    };

    const handleLocationCoordinateChange = (id: string, axis: 'x' | 'y', value: number) => {
        setProfile(prev => ({
            ...prev,
            initialLocations: (prev.initialLocations || []).map(loc =>
                loc.id === id ? { ...loc, coordinates: { ...loc.coordinates, [axis]: value } } : loc
            ),
        }));
    };

    return (
        <div className="space-y-4">
            {(profile.initialLocations || []).map((loc, index) => (
                <div key={loc.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-amber-300">Địa Điểm {index + 1}</h3>
                        <button type="button" onClick={() => handleRemoveInitialLocation(loc.id)} className="text-slate-500 hover:text-red-400 transition-colors"><RemoveIcon /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><FormLabel>Tên Địa Điểm</FormLabel><FormInput value={loc.name} onChange={e => handleUpdateInitialLocation(loc.id, 'name', e.target.value)} /></div>
                        <div><FormLabel>Loại</FormLabel><FormSelect value={loc.type} onChange={e => handleUpdateInitialLocation(loc.id, 'type', e.target.value as LocationType)}>{Object.values(LocationType).map(t => <option key={t} value={t}>{t}</option>)}</FormSelect></div>
                    </div>
                    
                    {loc.type !== LocationType.WORLD && (
                        <div>
                            <FormLabel>Địa Điểm Cha</FormLabel>
                            <FormSelect value={loc.parentId || ''} onChange={e => handleUpdateInitialLocation(loc.id, 'parentId', e.target.value || null)}>
                                <option value="">-- Không có (Địa điểm gốc) --</option>
                                {(profile.initialLocations || []).filter(parentLoc => parentLoc.id !== loc.id && parentLoc.name).map(parentLoc => (
                                    <option key={parentLoc.id} value={parentLoc.id}>{parentLoc.name}</option>
                                ))}
                            </FormSelect>
                        </div>
                    )}

                    {loc.parentId && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><FormLabel htmlFor={`loc-x-${loc.id}`}>Tọa độ X</FormLabel><FormInput id={`loc-x-${loc.id}`} type="number" value={loc.coordinates.x} onChange={e => handleLocationCoordinateChange(loc.id, 'x', parseInt(e.target.value, 10) || 0)} /></div>
                            <div><FormLabel htmlFor={`loc-y-${loc.id}`}>Tọa độ Y</FormLabel><FormInput id={`loc-y-${loc.id}`} type="number" value={loc.coordinates.y} onChange={e => handleLocationCoordinateChange(loc.id, 'y', parseInt(e.target.value, 10) || 0)} /></div>
                        </div>
                    )}

                    <div><FormLabel>Mô tả</FormLabel><FormTextArea value={loc.description} onChange={e => handleUpdateInitialLocation(loc.id, 'description', e.target.value)} /></div>
                    
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                        <input type="checkbox" id={`loc-destroyed-${loc.id}`} checked={loc.isDestroyed || false} onChange={e => handleUpdateInitialLocation(loc.id, 'isDestroyed', e.target.checked)} className="h-4 w-4 rounded text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500" />
                        <label htmlFor={`loc-destroyed-${loc.id}`} className="text-sm text-slate-300 select-none">Đã bị phá hủy?</label>
                    </div>
                </div>
            ))}
            <button type="button" onClick={handleAddInitialLocation} className="w-full mt-4 py-2 px-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-amber-300 hover:border-amber-400 transition-all">+ Thêm Địa Điểm</button>
        </div>
    );
};