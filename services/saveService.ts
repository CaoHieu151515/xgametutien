
import { FullGameState, SaveMetadata, CharacterProfile, WorldSettings, NPC, StoryPart, Choice, GameSnapshot } from '../types';
import { log } from './logService';

const DB_NAME = 'TuTienTruyenDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameSaves';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
    if (dbPromise) {
        return dbPromise;
    }
    log('saveService.ts', 'Opening IndexedDB connection...', 'FUNCTION');
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            log('saveService.ts', 'DB upgrade needed. Creating object store.', 'INFO');
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => {
            log('saveService.ts', 'DB connection successful.', 'INFO');
            resolve(request.result);
        };

        request.onerror = () => {
            log('saveService.ts', `DB connection error: ${request.error}`, 'ERROR');
            console.error('Lỗi khi mở IndexedDB:', request.error);
            reject(request.error);
        };
    });
    return dbPromise;
}

export const getAllSavesMetadata = async (): Promise<SaveMetadata[]> => {
    log('saveService.ts', 'Getting all saves metadata.', 'FUNCTION');
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const allSaves: FullGameState[] = request.result;
            allSaves.sort((a, b) => b.lastSaved - a.lastSaved);
            const metadata = allSaves.map(save => ({
                id: save.id,
                name: save.name,
                lastSaved: save.lastSaved,
                size: new Blob([JSON.stringify(save)]).size,
            }));
            log('saveService.ts', `Found ${metadata.length} saves.`, 'INFO');
            resolve(metadata);
        };

        request.onerror = () => {
            log('saveService.ts', `Error getting all saves: ${request.error}`, 'ERROR');
            reject(request.error);
        };
    });
};

export const getGame = async (id: string): Promise<FullGameState | undefined> => {
    log('saveService.ts', `Getting game with id: ${id}`, 'FUNCTION');
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
            log('saveService.ts', `Game ${id} ${request.result ? 'found' : 'not found'}.`, 'INFO');
            resolve(request.result as FullGameState | undefined);
        };

        request.onerror = () => {
            log('saveService.ts', `Error getting game ${id}: ${request.error}`, 'ERROR');
            reject(request.error);
        };
    });
};


export const saveGame = async (
    characterProfile: CharacterProfile,
    worldSettings: WorldSettings,
    npcs: NPC[],
    history: StoryPart[],
    choices: Choice[],
    gameLog: GameSnapshot[]
): Promise<void> => {
    log('saveService.ts', `Saving game for character: ${characterProfile.name}`, 'FUNCTION');
    const db = await openDB();
    const existingSave = await getGame(characterProfile.id);

    const saveName = existingSave?.name || `${characterProfile.name} - ${worldSettings.theme || 'Vô danh'}`;

    const gameState: FullGameState = {
        id: characterProfile.id,
        name: saveName,
        lastSaved: Date.now(),
        characterProfile,
        worldSettings,
        npcs,
        history,
        choices,
        gameLog,
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(gameState);

        request.onsuccess = () => {
            log('saveService.ts', `Game saved successfully for id: ${characterProfile.id}`, 'INFO');
            resolve();
        };

        request.onerror = () => {
            log('saveService.ts', `Error saving game ${characterProfile.id}: ${request.error}`, 'ERROR');
            reject(request.error);
        };
    });
};

export const deleteSave = async (id: string): Promise<void> => {
    log('saveService.ts', `Deleting save with id: ${id}`, 'FUNCTION');
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            log('saveService.ts', `Save ${id} deleted successfully.`, 'INFO');
            resolve();
        };

        request.onerror = () => {
            log('saveService.ts', `Error deleting save ${id}: ${request.error}`, 'ERROR');
            reject(request.error);
        };
    });
};

export const importSave = async (data: FullGameState): Promise<void> => {
    log('saveService.ts', `Importing save data for id: ${data.id}`, 'FUNCTION');
    const db = await openDB();
    if (!data || !data.id || !data.characterProfile || !data.worldSettings) {
        const errorMsg = "Invalid save data for import.";
        log('saveService.ts', errorMsg, 'ERROR');
        throw new Error(errorMsg);
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data);

        request.onsuccess = () => {
            log('saveService.ts', `Save ${data.id} imported successfully.`, 'INFO');
            resolve();
        };

        request.onerror = () => {
            log('saveService.ts', `Error importing save ${data.id}: ${request.error}`, 'ERROR');
            reject(request.error);
        };
    });
};