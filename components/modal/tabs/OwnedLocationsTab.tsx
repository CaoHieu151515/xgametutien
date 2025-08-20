
import React, { useState } from 'react';
import { CharacterProfile, Location } from '../../../types';
import { RulesEditor } from './shared/RulesEditor';

const LocationAccordionItem = ({ location, onUpdateLocation }: { location: Location, onUpdateLocation: (location: Location) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="bg-slate-900/50 rounded-lg border border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left"
                aria-expanded={isOpen}
            >
                <p className="font-semibold text-slate-200">{location.name}</p>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-700/50 animate-fade-in">
                    <p className="text-sm text-slate-400 whitespace-pre-wrap mb-4">{location.description}</p>
                    <RulesEditor 
                        rules={location.rules || []}
                        onUpdateRules={(newRules) => onUpdateLocation({ ...location, rules: newRules })}
                        title={`Luật Lệ cho '${location.name}'`}
                        description="Thêm các luật lệ mô tả hoặc cơ chế cho địa điểm này."
                    />
                </div>
            )}
        </div>
    );
};

interface OwnedLocationsTabProps {
    profile: CharacterProfile;
    onUpdateLocation: (location: Location) => void;
}

export const OwnedLocationsTab: React.FC<OwnedLocationsTabProps> = ({ profile, onUpdateLocation }) => {
    const ownedLocations = profile.discoveredLocations.filter(loc => loc.ownerId === profile.id && !loc.isDestroyed);

    return (
        <div className="space-y-4">
            {ownedLocations.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-slate-500">Bạn chưa sở hữu địa điểm nào.</p>
                </div>
            ) : (
                ownedLocations.map((loc) => (
                    <LocationAccordionItem key={loc.id} location={loc} onUpdateLocation={onUpdateLocation} />
                ))
            )}
        </div>
    );
};
