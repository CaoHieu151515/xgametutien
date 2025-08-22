import { StoryResponse, CharacterProfile, WorldSettings, Location, LocationType, Coordinates } from '../../types';

interface ApplyWorldMutationsParams {
    response: StoryResponse;
    profile: CharacterProfile;
    worldSettings: WorldSettings;
    notifications: string[];
}

interface WorldMutationResult {
    nextProfile: CharacterProfile;
    nextWorldSettings: WorldSettings;
}

export const applyWorldMutations = ({
    response,
    profile,
    worldSettings,
    notifications,
}: ApplyWorldMutationsParams): WorldMutationResult => {
    let nextProfile = { ...profile };
    let nextWorldSettings = { ...worldSettings };

    // --- Locations ---
    if (response.newLocations?.length) {
        const allCurrentCoordinates = [...nextProfile.discoveredLocations.map(l => l.coordinates)];
        const deconflictedNewLocations = response.newLocations.map((newLoc: Location) => {
            if (newLoc.type !== LocationType.WORLD && !newLoc.parentId) {
                newLoc.parentId = profile.currentLocationId;
            }

            let coords: Coordinates = { ...newLoc.coordinates };
            let attempts = 0;
            const minDistance = 50;
            let isOverlapping = true;

            while (isOverlapping && attempts < 100) {
                 isOverlapping = allCurrentCoordinates.some(existingCoord => 
                    Math.sqrt(Math.pow(existingCoord.x - coords.x, 2) + Math.pow(existingCoord.y - coords.y, 2)) < minDistance
                );
                if (isOverlapping) {
                    const angle = attempts * 0.5;
                    const radius = 5 + attempts * 0.5; 
                    coords.x = Math.round(coords.x + radius * Math.cos(angle));
                    coords.y = Math.round(coords.y + radius * Math.sin(angle));
                    coords.x = Math.max(10, Math.min(990, coords.x));
                    coords.y = Math.max(10, Math.min(990, coords.y));
                }
                attempts++;
            }
            allCurrentCoordinates.push(coords);
            return { ...newLoc, coordinates: coords };
        });
    
        const mappedNewLocations = deconflictedNewLocations
            .map((l: Location) => ({ ...(l.ownerId === 'player' ? { ...l, ownerId: nextProfile.id } : l), isNew: true }));
    
        mappedNewLocations.forEach(newLoc => {
            if (newLoc.ownerId === nextProfile.id) {
                notifications.push(`👑 Bây giờ bạn là chủ sở hữu của <b>${newLoc.name}</b>.`);
            }
        });
        nextProfile.discoveredLocations = [...nextProfile.discoveredLocations, ...mappedNewLocations];
    }

    if (response.updatedLocations?.length) {
        const validUpdatedLocations = response.updatedLocations.filter(l => l && typeof l === 'object');
        const updatedLocationsWithPlayerId = validUpdatedLocations.map(l => (l.ownerId === 'player' ? { ...l, ownerId: nextProfile.id } : l));
        const updatedLocationsMap = new Map(updatedLocationsWithPlayerId.map(l => [l.id, l]));

        nextProfile.discoveredLocations = nextProfile.discoveredLocations.map(loc => {
            const updatedData = updatedLocationsMap.get(loc.id);
            if (updatedData) {
                const mergedLocation = { ...loc, ...updatedData };
                if (mergedLocation.ownerId === nextProfile.id && loc.ownerId !== nextProfile.id) {
                    notifications.push(`👑 Bây giờ bạn là chủ sở hữu của <b>${mergedLocation.name}</b>.`);
                }
                if (mergedLocation.isDestroyed === false && loc.isDestroyed === true && loc.type === LocationType.WORLD) {
                    notifications.push(`🌍 Thế Giới <b>${loc.name}</b> đã được hồi sinh!`);
                }
                return mergedLocation;
            }
            return loc;
        });
    }

    // --- World Knowledge & Bestiary ---
    if (response.newWorldKnowledge?.length) {
        const uniqueNewKnowledge = response.newWorldKnowledge
            .filter(k => !nextWorldSettings.initialKnowledge.some(ek => ek.title === k.title))
            .map(k => ({ ...k, isNew: true }));
        uniqueNewKnowledge.forEach(k => notifications.push(`🧠 Phát hiện tri thức mới: <b>${k.title}</b>.`));
        nextWorldSettings.initialKnowledge = [...nextWorldSettings.initialKnowledge, ...uniqueNewKnowledge];
    }

    if (response.newMonsters?.length) {
        const newDiscoveredMonsters = response.newMonsters
            .filter(nm => !nextProfile.discoveredMonsters.some(dm => dm.name === nm.name))
            .map(nm => ({ id: `monster_${Date.now()}_${nm.name.replace(/\s+/g, '')}`, name: nm.name, description: nm.description, isNew: true, }));
        nextProfile.discoveredMonsters = [...nextProfile.discoveredMonsters, ...newDiscoveredMonsters];
    }

    return { nextProfile, nextWorldSettings };
};