import { useState, useCallback } from 'react';

export type ModalName = 'settings' | 'playerInfo' | 'worldInfo' | 'map' | 'npc' | 'gameLog' | 'inventory' | 'timeSkip' | 'event';

export const useModalManager = () => {
    const [modals, setModals] = useState({
        settings: false,
        playerInfo: false,
        worldInfo: false,
        map: false,
        npc: false,
        gameLog: false,
        inventory: false,
        timeSkip: false,
        event: false,
    });

    const openModal = useCallback((name: ModalName) => {
        setModals(prev => ({ ...prev, [name]: true }));
    }, []);

    const closeModal = useCallback((name: ModalName) => {
        setModals(prev => ({ ...prev, [name]: false }));
    }, []);

    return {
        modals,
        openModal,
        closeModal,
    };
};