import { useState, useCallback, useMemo } from 'react';
import { AppSettings, ApiProvider, NarrativePerspective } from '../../types';
import { log } from '../../services/logService';
import * as geminiService from '../../services/geminiService';
import * as openaiService from '../../services/openaiService';

const SETTINGS_KEY = 'tuTienTruyenSettings_v2';
const USE_DEFAULT_KEY_IDENTIFIER = '_USE_DEFAULT_KEY_';

export const useSettingsLogic = () => {
    const [settings, setSettings] = useState<AppSettings>(() => {
        const defaultSettings: AppSettings = {
            isMature: false,
            perspective: NarrativePerspective.SECOND_PERSON,
            apiProvider: ApiProvider.GEMINI,
            openaiApiKey: '',
            gemini: {
                useDefault: true,
                customKeys: [],
                activeCustomKeyId: null
            },
            historyContextSize: 10,
            storyFontSize: 18,
            avatarBackgroundOpacity: 50,
            storyBackgroundOpacity: 70,
            maxWordsPerTurn: 500,
        };
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                log('useSettingsLogic.ts', 'Loaded settings from localStorage.', 'STATE');
                return { ...defaultSettings, ...parsed, gemini: { ...defaultSettings.gemini, ...(parsed.gemini || {}) } };
            }
            return defaultSettings;
        } catch {
            return defaultSettings;
        }
    });

    const api = useMemo(() => {
        if (settings.apiProvider === ApiProvider.OPENAI) {
            return openaiService;
        }
        return geminiService;
    }, [settings.apiProvider]);

    const apiKeyForService = useMemo(() => {
        if (settings.apiProvider === ApiProvider.OPENAI) {
            return settings.openaiApiKey;
        }
        if (settings.gemini.useDefault) {
            return USE_DEFAULT_KEY_IDENTIFIER;
        }
        const activeKey = settings.gemini.customKeys.find(k => k.id === settings.gemini.activeCustomKeyId);
        return activeKey ? activeKey.key : '';
    }, [settings]);

    const saveSettings = useCallback((newSettings: AppSettings) => {
        log('useSettingsLogic.ts', 'Saving settings.', 'FUNCTION');
        setSettings(newSettings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    }, []);

    return { settings, saveSettings, apiKeyForService, api };
};