

import { useState, useCallback, useMemo, useEffect } from 'react';
import * as geminiService from '../services/geminiService';
import * as openaiService from '../services/openaiService';
import * as saveService from '../services/saveService';
import { StoryPart, StoryResponse, GameState, NarrativePerspective, CharacterProfile, WorldSettings, StatusEffect, Skill, Location, NPC, NewNPCFromAI, WorldKnowledge, Choice, ApiProvider, AppSettings, GameSnapshot, Item, ItemType, FullGameState, StoryApiResponse, CharacterGender } from '../types';
import { processLevelUps, getRealmDisplayName, calculateBaseStatsForLevel, processSkillLevelUps, processNpcLevelUps, recalculateDerivedStats, getLevelFromRealmName, calculateExperienceForBreakthrough } from '../services/progressionService';
import { log } from '../services/logService';

const SETTINGS_KEY = 'tuTienTruyenSettings_v2';
const USE_DEFAULT_KEY_IDENTIFIER = '_USE_DEFAULT_KEY_';

const parseTurnDuration = (duration: string): number | null => {
    const match = duration.match(/(\d+)\s*lượt/i);
    return match ? parseInt(match[1], 10) : null;
};

const updateStatusEffectDurations = <T extends CharacterProfile | NPC>(entity: T): T => {
    if (!entity.statusEffects || entity.statusEffects.length === 0) {
        return entity;
    }

    const updatedEffects = entity.statusEffects.map(effect => {
        const turns = parseTurnDuration(effect.duration);
        if (turns !== null && turns > 0) {
            const newTurns = turns - 1;
            if (newTurns > 0) {
                return { ...effect, duration: `${newTurns} lượt` };
            }
            return null;
        }
        return effect;
    }).filter((effect): effect is StatusEffect => effect !== null);

    return { ...entity, statusEffects: updatedEffects };
};


export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.HOME);
    const [hasSaves, setHasSaves] = useState<boolean>(false);
    const [characterProfile, setCharacterProfile] = useState<CharacterProfile | null>(null);
    const [worldSettings, setWorldSettings] = useState<WorldSettings | null>(null);
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
        };
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                log('useGameLogic.ts', 'Loaded settings from localStorage.', 'STATE');
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
        // For Gemini
        if (settings.gemini.useDefault) {
            return USE_DEFAULT_KEY_IDENTIFIER;
        }
        const activeKey = settings.gemini.customKeys.find(k => k.id === settings.gemini.activeCustomKeyId);
        return activeKey ? activeKey.key : '';

    }, [settings]);

    const [history, setHistory] = useState<StoryPart[]>([]);
    const [displayHistory, setDisplayHistory] = useState<StoryPart[]>([]);
    const [choices, setChoices] = useState<Choice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [npcs, setNpcs] = useState<NPC[]>([]);
    const [gameLog, setGameLog] = useState<GameSnapshot[]>([]);

    useEffect(() => {
        log('useGameLogic.ts', `Game state changed to: ${GameState[gameState]}`, 'STATE');
        if (gameState === GameState.HOME) {
            const checkSaves = async () => {
                setIsLoading(true);
                try {
                    const saves = await saveService.getAllSavesMetadata();
                    setHasSaves(saves.length > 0);
                } catch (e) {
                    console.error("Could not check for saves", e);
                    setHasSaves(false);
                } finally {
                    setIsLoading(false);
                }
            };
            checkSaves();
        }
    }, [gameState]);
    
    const handleUpdateLocation = useCallback((updatedLocation: Location) => {
        log('useGameLogic.ts', `Updating location: ${updatedLocation.name}`, 'FUNCTION');
        setCharacterProfile(prev => {
            if (!prev) return null;
            return {
                ...prev,
                discoveredLocations: prev.discoveredLocations.map(loc => 
                    loc.id === updatedLocation.id ? updatedLocation : loc
                )
            };
        });
    }, []);

    const handleUpdateWorldSettings = useCallback((newSettings: WorldSettings) => {
        log('useGameLogic.ts', 'Updating world settings.', 'FUNCTION');
        setWorldSettings(newSettings);
    }, []);

    const handleAction = useCallback(async (choice: Choice) => {
        if (!characterProfile || !worldSettings) return;
        log('useGameLogic.ts', `Player action: "${choice.title}"`, 'FUNCTION');

        setIsLoading(true);
        setError(null);

        const preActionState = { characterProfile, worldSettings, npcs, history, choices };

        const newActionPart: StoryPart = {
            id: Date.now(),
            type: 'action',
            text: choice.title
        };

        const currentHistoryForApi = [...history, newActionPart];
        setChoices([]);
        
        const historySize = settings.historyContextSize;
        const historyPartsToTake = historySize > 0 ? (historySize * 2) : 0;
        const relevantHistory = historySize > 0 ? currentHistoryForApi.slice(-historyPartsToTake) : [];

        const historyText = relevantHistory
            .map(part => `${part.type === 'story' ? 'Bối cảnh' : 'Người chơi'}: ${part.text}`)
            .join('\n');
            
        try {
            const { storyResponse, usageMetadata }: StoryApiResponse = await api.getNextStoryStep(historyText, choice.title, settings.isMature, settings.perspective, characterProfile, worldSettings, npcs, apiKeyForService);
            const response = storyResponse;
            log('useGameLogic.ts', 'Received story response from API.', 'INFO');
            
            let nextProfile: CharacterProfile = { 
                ...characterProfile,
                items: characterProfile.items.map(i => ({ ...i, isNew: false })),
                skills: characterProfile.skills.map(s => ({ ...s, isNew: false })),
                discoveredLocations: characterProfile.discoveredLocations.map(loc => ({ ...loc, isNew: false })),
                discoveredMonsters: characterProfile.discoveredMonsters.map(m => ({...m, isNew: false })),
                discoveredItems: (characterProfile.discoveredItems || []).map(i => ({...i, isNew: false})),
            };
            let nextNpcs: NPC[] = npcs.map(npc => ({ ...npc, isNew: false }));
            let finalWorldSettings: WorldSettings = {
                ...worldSettings,
                initialKnowledge: worldSettings.initialKnowledge.map(k => ({...k, isNew: false}))
            };
            const notifications: string[] = [];

            if (usageMetadata?.totalTokenCount) {
                notifications.push(`✨ Đã sử dụng <b>${usageMetadata.totalTokenCount.toLocaleString()} tokens</b> cho lượt này.`);
            }
            
            if (choice.durationInMinutes > 0) {
                 const hours = Math.floor(choice.durationInMinutes / 60);
                 const minutes = choice.durationInMinutes % 60;
                 let timeString = '';
                 if (hours > 0) timeString += `${hours} giờ `;
                 if (minutes > 0) timeString += `${minutes} phút`;
                 notifications.push(`⏳ Thời gian đã trôi qua: <b>${timeString.trim()}</b>.`);
            }
            
            if (response.updatedSkills?.length) {
                let tempSkills = [...nextProfile.skills];
                response.updatedSkills.forEach(skillUpdate => {
                    const skillIndex = tempSkills.findIndex(s => s.name === skillUpdate.skillName);
                    if (skillIndex !== -1) {
                        const originalSkill = tempSkills[skillIndex];
                        notifications.push(`💪 Kỹ năng "<b>${originalSkill.name}</b>" nhận được <b>${skillUpdate.gainedExperience} EXP</b>.`);
                        
                        const { updatedSkill, breakthroughInfo } = processSkillLevelUps(
                            originalSkill,
                            skillUpdate.gainedExperience,
                            finalWorldSettings.qualityTiers
                        );
                        
                        tempSkills[skillIndex] = updatedSkill;
    
                        if (breakthroughInfo) {
                            notifications.push(`🔥 **ĐỘT PHÁ!** Kỹ năng "<b>${originalSkill.name}</b>" đã đột phá từ <b>${breakthroughInfo.oldQuality}</b> lên <b>${breakthroughInfo.newQuality}</b>!`);
                             
                            api.generateNewSkillDescription(updatedSkill, breakthroughInfo.newQuality, finalWorldSettings, apiKeyForService)
                                .then(newDetails => {
                                    setCharacterProfile(prev => {
                                        if (!prev) return null;
                                        const freshSkills = prev.skills.map(s => 
                                            s.id === updatedSkill.id 
                                                ? { ...s, description: newDetails.description, effect: newDetails.effect } 
                                                : s
                                        );
                                        return { ...prev, skills: freshSkills };
                                    });
                                })
                                .catch(err => {
                                    console.error("Lỗi khi tạo mô tả kỹ năng mới:", err);
                                });
                        }
                    }
                });
                nextProfile.skills = tempSkills;
            }

            if (response.updatedStats?.currencyAmount !== undefined && response.updatedStats.currencyAmount !== characterProfile.currencyAmount) {
                const change = response.updatedStats.currencyAmount - characterProfile.currencyAmount;
                const currencyName = characterProfile.currencyName || 'tiền';
                if (change > 0) {
                    notifications.push(`💰 Bạn nhận được <b>${change.toLocaleString()} ${currencyName}</b>.`);
                } else if (change < 0) {
                    notifications.push(`💸 Bạn đã tiêu <b>${Math.abs(change).toLocaleString()} ${currencyName}</b>.`);
                }
            }

            if (response.removedItemIds?.length) {
                response.removedItemIds.forEach(itemId => {
                    const removedItem = characterProfile.items.find(i => i.id === itemId);
                    if (removedItem) {
                        notifications.push(`🎒 Đã sử dụng <b>[${removedItem.quality}] ${removedItem.name}</b> (x${removedItem.quantity}).`);
                    }
                });
            }
            if (response.updatedItems?.length) {
                response.updatedItems.forEach(update => {
                    const originalItem = characterProfile.items.find(i => i.name === update.name);
                    if (originalItem && update.quantity < originalItem.quantity) {
                        const quantityUsed = originalItem.quantity - update.quantity;
                        notifications.push(`🎒 Đã sử dụng <b>${quantityUsed} [${originalItem.quality}] ${originalItem.name}</b>.`);
                    }
                });
            }

            response.newItems?.forEach(item => notifications.push(`✨ Bạn nhận được vật phẩm: <b>${item.name}</b> (x${item.quantity}).`));
            response.newSkills?.forEach(s => notifications.push(`📖 Bạn đã lĩnh ngộ kỹ năng mới: <b>${s.name}</b>.`));
            response.newLocations?.forEach(l => notifications.push(`🗺️ Bạn đã khám phá ra địa điểm mới: <b>${l.name}</b>.`));
            response.newNPCs?.forEach(n => notifications.push(`👥 Bạn đã gặp gỡ <b>${n.name}</b>.`));
            response.newMonsters?.forEach(m => notifications.push(`🐾 Bạn đã phát hiện ra sinh vật mới: <b>${m.name}</b>.`));

            if (response.newWorldKnowledge?.length) {
                const uniqueNewKnowledge = response.newWorldKnowledge.filter(
                    newK => !finalWorldSettings.initialKnowledge.some(existing => existing.id === newK.id)
                ).map(k => ({ ...k, isNew: true }));
        
                uniqueNewKnowledge.forEach(k => {
                    if (k.category === 'Bang Phái') {
                         notifications.push(`🌍 Bạn đã khám phá ra thế lực mới: <b>${k.title}</b>.`);
                    } else {
                         notifications.push(`🧠 Bạn đã học được tri thức mới: <b>${k.title}</b>.`);
                    }
                });
        
                finalWorldSettings.initialKnowledge = [...finalWorldSettings.initialKnowledge, ...uniqueNewKnowledge];
            }

            if (response.newMonsters?.length) {
                const newDiscoveredMonsters = response.newMonsters
                    .filter(newMonster => !nextProfile.discoveredMonsters.some(existing => existing.name === newMonster.name))
                    .map(newMonster => ({
                        id: `monster_${Date.now()}_${newMonster.name.replace(/\s+/g, '')}`,
                        name: newMonster.name,
                        description: newMonster.description,
                        isNew: true,
                    }));
                nextProfile.discoveredMonsters = [...nextProfile.discoveredMonsters, ...newDiscoveredMonsters];
            }
            
            if (response.updatedPlayerLocationId !== undefined && response.updatedPlayerLocationId !== characterProfile.currentLocationId) {
                let newLocName = 'Không Gian Hỗn Độn';
                if (response.updatedPlayerLocationId !== null) {
                    const allKnownLocations = [...nextProfile.discoveredLocations, ...(response.newLocations || []), ...(response.updatedLocations || [])];
                    const newLoc = allKnownLocations.find(l => l.id === response.updatedPlayerLocationId);
                    if (newLoc) newLocName = newLoc.name;
                }
                notifications.push(`🚶 Bạn đã di chuyển đến <b>${newLocName}</b>.`);
            }

            if (response.newNPCs?.length) {
                const brandNewNpcs: NPC[] = response.newNPCs.map((newNpcData: NewNPCFromAI) => {
                    const isValidPowerSystem = finalWorldSettings.powerSystems.some(ps => ps.name === newNpcData.powerSystem);
                    const npcLevel = isValidPowerSystem ? newNpcData.level : 1;
                    const npcPowerSystem = isValidPowerSystem 
                        ? newNpcData.powerSystem 
                        : (finalWorldSettings.powerSystems[0]?.name || '');

                    const stats = calculateBaseStatsForLevel(npcLevel);
                    return {
                        ...newNpcData,
                        level: npcLevel,
                        powerSystem: npcPowerSystem,
                        experience: 0,
                        health: stats.maxHealth,
                        mana: stats.maxMana,
                        realm: getRealmDisplayName(npcLevel, npcPowerSystem, finalWorldSettings),
                        relationship: 0,
                        memories: [],
                        npcRelationships: newNpcData.npcRelationships || [],
                        isDaoLu: newNpcData.isDaoLu || false,
                        isNew: true,
                    };
                });
                nextNpcs = [...nextNpcs, ...brandNewNpcs];
            }

            if (response.updatedNPCs?.length) {
                const npcsToUpdateMap = new Map(nextNpcs.map(n => [n.id, n]));
                response.updatedNPCs.forEach(update => {
                    const existingNpc = npcsToUpdateMap.get(update.id);
                    if (existingNpc) {
                        let modifiedNpc = { ...existingNpc };
            
                        if (update.isDead === true) {
                            modifiedNpc.isDead = true;
                            modifiedNpc.locationId = null;
                            notifications.push(`💀 <b>${modifiedNpc.name}</b> đã tử vong.`);
                        } else if (update.isDead === false && existingNpc.isDead) { // Revival logic
                            modifiedNpc.isDead = false;
                            const stats = calculateBaseStatsForLevel(modifiedNpc.level);
                            modifiedNpc.health = stats.maxHealth;
                            modifiedNpc.mana = stats.maxMana;
                            notifications.push(`✨ <b>${modifiedNpc.name}</b> đã được hồi sinh!`);
                        }
                        
                        if (!modifiedNpc.isDead) {
                            let gainedNpcXp = update.gainedExperience ?? 0;

                            if (update.breakthroughToRealm) {
                                const targetLevel = getLevelFromRealmName(update.breakthroughToRealm, modifiedNpc.powerSystem, finalWorldSettings);
                                if (targetLevel > modifiedNpc.level) {
                                    const xpForBreakthrough = calculateExperienceForBreakthrough(
                                        modifiedNpc.level,
                                        modifiedNpc.experience,
                                        targetLevel
                                    );
                                    gainedNpcXp += xpForBreakthrough;
                                    notifications.push(`✨ **TRỢ GIÚP ĐỘT PHÁ!** <b>${modifiedNpc.name}</b> nhận được một lượng lớn kinh nghiệm để đạt đến <b>${update.breakthroughToRealm}</b>.`);
                                }
                            }

                            if (gainedNpcXp > 0) {
                                const oldLevel = modifiedNpc.level;
                                const oldRealm = modifiedNpc.realm;
                                modifiedNpc = processNpcLevelUps(modifiedNpc, gainedNpcXp, finalWorldSettings);
                                if (modifiedNpc.level > oldLevel) {
                                    notifications.push(`✨ <b>${modifiedNpc.name}</b> đã đạt đến <b>cấp độ ${modifiedNpc.level}</b>!`);
                                    if (modifiedNpc.realm !== oldRealm) {
                                        notifications.push(`⚡️ **ĐỘT PHÁ!** <b>${modifiedNpc.name}</b> đã tiến vào cảnh giới <b>${modifiedNpc.realm}</b>.`);
                                    }
                                }
                            }
            
                            if (update.isDaoLu && !existingNpc.isDaoLu) {
                                modifiedNpc.isDaoLu = true;
                                modifiedNpc.relationship = 1000;
                                notifications.push(`❤️ Bạn và <b>${modifiedNpc.name}</b> đã trở thành Đạo Lữ!`);
                            } else if (existingNpc.isDaoLu) {
                                modifiedNpc.relationship = 1000;
                            } else if (update.relationship !== undefined && update.relationship !== existingNpc.relationship) {
                                const oldRelationship = existingNpc.relationship;
                                const newRelationshipFromAI = update.relationship;
                                const change = newRelationshipFromAI - oldRelationship;
                                const cappedChange = Math.max(-100, Math.min(100, change));
                                const finalRelationship = oldRelationship + cappedChange;
            
                                modifiedNpc.relationship = finalRelationship;
                                
                                if (cappedChange !== 0) {
                                    const changeText = cappedChange > 0 
                                        ? `<span class='text-green-400'>tăng ${cappedChange}</span>` 
                                        : `<span class='text-red-400'>giảm ${Math.abs(cappedChange)}</span>`;
                                    notifications.push(`😊 Hảo cảm của <b>${modifiedNpc.name}</b> đã ${changeText} điểm (hiện tại: ${finalRelationship}).`);
                                }
                            }
                            
                            if (update.gender !== undefined && update.gender !== existingNpc.gender) {
                                modifiedNpc.gender = update.gender;
                                notifications.push(`🚻 Giới tính của <b>${modifiedNpc.name}</b> đã thay đổi thành <b>${update.gender === 'male' ? 'Nam' : 'Nữ'}</b>!`);
                            }
                            if (update.memories !== undefined) modifiedNpc.memories = update.memories;
                            if (update.health !== undefined) modifiedNpc.health = update.health;
                            if (update.mana !== undefined) modifiedNpc.mana = update.mana;
                            if (update.personality !== undefined) modifiedNpc.personality = update.personality;
                            if (update.description !== undefined) modifiedNpc.description = update.description;
                            if (update.locationId !== undefined) modifiedNpc.locationId = update.locationId;
                            if (update.aptitude !== undefined) modifiedNpc.aptitude = update.aptitude;
                            if (update.updatedNpcRelationships !== undefined) modifiedNpc.npcRelationships = update.updatedNpcRelationships || [];
            
                            let currentStatusEffects = modifiedNpc.statusEffects;
                            if (update.removedStatusEffects?.length) {
                                const effectsToRemove = new Set(update.removedStatusEffects);
                                const removedEffects = currentStatusEffects.filter(effect => effectsToRemove.has(effect.name));
                                removedEffects.forEach(effect => {
                                    notifications.push(`🍃 Trạng thái "<b>${effect.name}</b>" của <b>${modifiedNpc.name}</b> đã kết thúc.`);
                                });
                                currentStatusEffects = currentStatusEffects.filter(effect => !effectsToRemove.has(effect.name));
                            }
                            if (update.newStatusEffects?.length) {
                                update.newStatusEffects.forEach(effect => {
                                    notifications.push(`✨ <b>${modifiedNpc.name}</b> nhận được trạng thái: <b>${effect.name}</b>.`);
                                });
                                currentStatusEffects = [...currentStatusEffects, ...update.newStatusEffects];
                            }
                            modifiedNpc.statusEffects = currentStatusEffects;
                        }
            
                        npcsToUpdateMap.set(update.id, modifiedNpc);
                    }
                });
                nextNpcs = Array.from(npcsToUpdateMap.values());
            }

            let newItems = [...nextProfile.items];
            if (response.removedItemIds) {
                const idsToRemove = new Set(response.removedItemIds);
                newItems = newItems.filter(item => !idsToRemove.has(item.id));
            }
            if (response.updatedItems) {
                response.updatedItems.forEach(update => {
                    const itemIndex = newItems.findIndex(i => i.name === update.name);
                    if (itemIndex > -1) {
                        newItems[itemIndex].quantity = update.quantity;
                    }
                });
                newItems = newItems.filter(item => item.quantity > 0);
            }
            if (response.newItems) {
                response.newItems.forEach(newItem => {
                    const existingItemIndex = newItems.findIndex(i => i.name === newItem.name);
                    const isEquipment = newItem.type === ItemType.TRANG_BI || newItem.type === ItemType.DAC_THU;
                    if (existingItemIndex > -1 && !isEquipment) {
                        newItems[existingItemIndex].quantity += newItem.quantity;
                        newItems[existingItemIndex].isNew = true;
                    } else {
                        newItems.push({ ...newItem, isNew: true });
                    }
                });
            }
            nextProfile.items = newItems;

            if (response.newItems) {
                const existingDiscovered = nextProfile.discoveredItems || [];
                const discoveredNames = new Set(existingDiscovered.map(i => i.name));
                
                const newlyDiscovered = response.newItems
                    .filter(newItem => !discoveredNames.has(newItem.name))
                    .map(newItem => ({ ...newItem, isNew: true }));

                if (newlyDiscovered.length > 0) {
                    nextProfile.discoveredItems = [...existingDiscovered, ...newlyDiscovered];
                }
            }

            if (response.newSkills?.length) {
                const newlyAcquiredSkills: Skill[] = response.newSkills.map((newSkillPart, index) => ({
                    ...newSkillPart,
                    id: `${Date.now()}-${index}`,
                    level: 1,
                    experience: 0,
                    isNew: true,
                }));
                nextProfile.skills = [...nextProfile.skills, ...newlyAcquiredSkills];
            }

            if (response.newLocations?.length) {
                const existingLocationIds = new Set(nextProfile.discoveredLocations.map(l => l.id));
                const uniqueNewLocations = response.newLocations
                    .filter(l => !existingLocationIds.has(l.id))
                    .map(l => ({ 
                        ...(l.ownerId === 'player' ? { ...l, ownerId: nextProfile.id } : l),
                        isNew: true
                    }));

                uniqueNewLocations.forEach(newLoc => {
                    if (newLoc.ownerId === nextProfile.id) {
                        notifications.push(`👑 Bây giờ bạn là chủ sở hữu của <b>${newLoc.name}</b>.`);
                    }
                });

                nextProfile.discoveredLocations = [...nextProfile.discoveredLocations, ...uniqueNewLocations];
            }
            
            if (response.updatedLocations?.length) {
                const updatedLocationsWithPlayerId = response.updatedLocations.map(l =>
                    l.ownerId === 'player' ? { ...l, ownerId: nextProfile.id } : l
                );
                const updatedLocationsMap = new Map(updatedLocationsWithPlayerId.map(l => [l.id, l]));

                nextProfile.discoveredLocations.forEach(oldLoc => {
                    const updatedData = updatedLocationsMap.get(oldLoc.id);
                    if (updatedData && updatedData.ownerId === nextProfile.id && oldLoc.ownerId !== nextProfile.id) {
                        notifications.push(`👑 Bây giờ bạn là chủ sở hữu của <b>${updatedData.name}</b>.`);
                    }
                });

                nextProfile.discoveredLocations = nextProfile.discoveredLocations.map(loc => {
                    const updatedData = updatedLocationsMap.get(loc.id);
                    if (updatedData) {
                        return { ...loc, ...updatedData, isNew: loc.isNew };
                    }
                    return loc;
                });
            }
        
            if (response.updatedStats) {
                const stats = response.updatedStats;
                nextProfile.health = stats.health ?? nextProfile.health;
                nextProfile.mana = stats.mana ?? nextProfile.mana;
                nextProfile.currencyAmount = stats.currencyAmount ?? nextProfile.currencyAmount;
        
                let currentStatusEffects = nextProfile.statusEffects.filter(e => e.duration !== 'Trang bị');
                if (stats.removedStatusEffects?.length) {
                    const effectsToRemove = new Set(stats.removedStatusEffects);
                    const removedEffects = currentStatusEffects.filter(effect => effectsToRemove.has(effect.name));
                    removedEffects.forEach(effect => {
                        notifications.push(`🍃 Trạng thái "<b>${effect.name}</b>" của bạn đã kết thúc.`);
                    });
                    currentStatusEffects = currentStatusEffects.filter(effect => !effectsToRemove.has(effect.name));
                }
                if (stats.newStatusEffects?.length) {
                    stats.newStatusEffects.forEach(effect => {
                        notifications.push(`✨ Bạn nhận được trạng thái: <b>${effect.name}</b>.`);
                    });
                    currentStatusEffects = [...currentStatusEffects, ...stats.newStatusEffects];
                }
                nextProfile.statusEffects = currentStatusEffects;
            }

            let gainedXp = response.updatedStats?.gainedExperience ?? 0;
            const breakthroughRealm = response.updatedStats?.breakthroughToRealm;
        
            if (breakthroughRealm) {
                const targetLevel = getLevelFromRealmName(breakthroughRealm, nextProfile.powerSystem, finalWorldSettings);
                if (targetLevel > nextProfile.level) {
                     const xpForBreakthrough = calculateExperienceForBreakthrough(
                        nextProfile.level,
                        nextProfile.experience,
                        targetLevel
                    );
                    gainedXp += xpForBreakthrough;
                    notifications.push(`✨ **ĐỘT PHÁ THẦN TỐC!** Vận may ập đến, bạn nhận được một lượng lớn kinh nghiệm để đạt đến <b>${breakthroughRealm}</b>.`);
                }
            }
            
            if (gainedXp > 0) {
                if ((response.updatedStats?.gainedExperience ?? 0) > 0 && !breakthroughRealm) {
                    notifications.push(`Bạn nhận được <b>${gainedXp.toLocaleString()} EXP</b>.`);
                }
                const oldLevel = nextProfile.level;
                const oldRealm = nextProfile.realm;
                nextProfile = processLevelUps(nextProfile, gainedXp, finalWorldSettings);
                if (nextProfile.level > oldLevel) {
                    notifications.push(`🎉 Chúc mừng! Bạn đã đạt đến <b>cấp độ ${nextProfile.level}</b>.`);
                    if (nextProfile.realm !== oldRealm) {
                         notifications.push(`⚡️ Đột phá! Bạn đã tiến vào cảnh giới <b>${nextProfile.realm}</b>.`);
                    }
                }
            } else {
                nextProfile = recalculateDerivedStats(nextProfile);
            }

            if (response.updatedGender && response.updatedGender !== nextProfile.gender) {
                nextProfile.gender = response.updatedGender;
                notifications.push(`🚻 Giới tính của bạn đã thay đổi thành <b>${response.updatedGender === 'male' ? 'Nam' : 'Nữ'}</b>!`);
            }

            // Critical fix: Apply location update AFTER all other profile modifications to prevent overwrites.
            if (response.updatedPlayerLocationId !== undefined) {
                nextProfile.currentLocationId = response.updatedPlayerLocationId;
            }

            const timePassedInMinutes = choice.durationInMinutes;
            if (timePassedInMinutes > 0) {
                const oldDate = new Date(nextProfile.gameTime);
                const newDate = new Date(oldDate.getTime() + timePassedInMinutes * 60 * 1000);
                
                const yearsPassed = newDate.getFullYear() - oldDate.getFullYear();
                if (yearsPassed > 0) {
                    nextProfile.lifespan -= yearsPassed;
                }
                nextProfile.gameTime = newDate.toISOString();
            }

            // Apply turn-based status effect reduction
            nextProfile = updateStatusEffectDurations(nextProfile);
            nextNpcs = nextNpcs.map(npc => updateStatusEffectDurations(npc));

            const newStoryPart: StoryPart = {
                id: Date.now() + 1,
                type: 'story',
                text: response.story,
                notifications,
            };

            const newTurnNumber = (gameLog[gameLog.length - 1]?.turnNumber || 0) + 1;
            const newSnapshot: GameSnapshot = {
                turnNumber: newTurnNumber,
                preActionState,
                turnContent: {
                    playerAction: newActionPart,
                    storyResult: newStoryPart,
                },
            };
            
            const finalHistory = [...history, newActionPart, newStoryPart];
            const finalChoices = response.choices;
            const finalGameLog = [...gameLog, newSnapshot];

            setGameLog(finalGameLog);
            setHistory(finalHistory);
            setChoices(finalChoices);
            setCharacterProfile(nextProfile);
            setNpcs(nextNpcs);
            setWorldSettings(finalWorldSettings);

        } catch (e: any) {
            setError(`Lỗi khi tạo bước tiếp theo của câu chuyện: ${e.message}`);
            setGameState(GameState.ERROR);
        } finally {
            setIsLoading(false);
        }
    }, [characterProfile, worldSettings, npcs, history, gameLog, settings, api, apiKeyForService, choices]);
    
    const handleUseItem = useCallback((item: Item) => {
        log('useGameLogic.ts', `Player uses item: "${item.name}"`, 'FUNCTION');
        
        const useChoice: Choice = {
            title: `Sử dụng ${item.name}`,
            benefit: item.effectsDescription || 'Chưa rõ',
            risk: 'Có thể có tác dụng phụ',
            successChance: 95,
            durationInMinutes: 0,
        };
        
        handleAction(useChoice);
    }, [handleAction]);

    useEffect(() => {
        if (history.length === 0) {
            setDisplayHistory([]);
        } else if (history.length === 1) {
            setDisplayHistory([history[0]]);
        } else {
            setDisplayHistory(history.slice(-2));
        }
    }, [history]);

    const handleSave = useCallback(async () => {
        if (!characterProfile || !worldSettings) {
            log('useGameLogic.ts', 'Save aborted: profile or world settings are null.', 'ERROR');
            return;
        }
        log('useGameLogic.ts', 'Saving game...', 'FUNCTION');
        setIsLoading(true);
        try {
            await saveService.saveGame(
                characterProfile,
                worldSettings,
                npcs,
                history,
                choices,
                gameLog
            );
            log('useGameLogic.ts', 'Game saved successfully.', 'INFO');
        } catch(e) {
            setError(`Lỗi khi lưu game: ${(e as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    }, [characterProfile, worldSettings, npcs, history, choices, gameLog]);

    const loadState = useCallback((state: {
        characterProfile: CharacterProfile;
        worldSettings: WorldSettings;
        npcs: NPC[];
        history: StoryPart[];
        choices: Choice[];
        gameLog: GameSnapshot[];
    }) => {
        setCharacterProfile(state.characterProfile);
        setWorldSettings(state.worldSettings);
        setNpcs(state.npcs);
        setHistory(state.history);
        setChoices(state.choices);
        setGameLog(state.gameLog);
    }, []);

    const handleRewind = useCallback((turnNumber: number) => {
        log('useGameLogic.ts', `Rewinding to turn ${turnNumber}`, 'FUNCTION');
        const snapshot = gameLog.find(s => s.turnNumber === turnNumber);
        if (snapshot) {
            const stateToLoad = {
                ...snapshot.preActionState,
                gameLog: gameLog.filter(s => s.turnNumber < turnNumber)
            };
            loadState(stateToLoad);
            log('useGameLogic.ts', 'Rewind successful.', 'INFO');
        }
    }, [gameLog, loadState]);

    const handleContinue = async () => {
        log('useGameLogic.ts', 'Continuing last game.', 'FUNCTION');
        setIsLoading(true);
        try {
            const saves = await saveService.getAllSavesMetadata();
            if (saves.length > 0) {
                const lastSave = await saveService.getGame(saves[0].id);
                if (lastSave) {
                    handleLoadGame(lastSave);
                } else {
                     setError("Không thể tải bản lưu cuối cùng.");
                     setGameState(GameState.ERROR);
                }
            }
        } catch(e) {
            setError(`Không thể tải bản lưu: ${(e as Error).message}`);
            setGameState(GameState.ERROR);
        }
    };
    
    const handleRestart = useCallback(() => {
        log('useGameLogic.ts', 'Restarting game.', 'FUNCTION');
        setCharacterProfile(null);
        setWorldSettings(null);
        setHistory([]);
        setDisplayHistory([]);
        setChoices([]);
        setNpcs([]);
        setGameLog([]);
        setError(null);
        setGameState(GameState.HOME);
    }, []);
    
    const handleLoadGame = useCallback((saveData: FullGameState) => {
        log('useGameLogic.ts', `Loading game: ${saveData.name}`, 'FUNCTION');
        loadState(saveData);
        setGameState(GameState.PLAYING);
        setIsLoading(false);
    }, [loadState]);
    
    const handleGoHome = useCallback(() => {
        log('useGameLogic.ts', 'Going back to home screen.', 'FUNCTION');
        handleSave();
        handleRestart();
    }, [handleSave, handleRestart]);

    const saveSettings = useCallback((newSettings: AppSettings) => {
        log('useGameLogic.ts', 'Saving settings.', 'FUNCTION');
        setSettings(newSettings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    }, []);

    const handleStartGame = useCallback(async (profile: CharacterProfile, worldSettings: WorldSettings) => {
        log('useGameLogic.ts', 'Starting new game.', 'FUNCTION');
        setIsLoading(true);
        setError(null);
    
        const newProfile: CharacterProfile = {
            ...profile,
            id: `char_${Date.now()}`,
            items: profile.initialItems || [],
            currentLocationId: profile.initialLocations?.[0]?.id || null,
            discoveredLocations: profile.initialLocations || [],
            discoveredMonsters: profile.initialMonsters || [],
            discoveredItems: profile.initialItems || [],
            gameTime: new Date().toISOString(),
        };
        const newWorldSettings = { ...worldSettings };
        
        const finalProfile = processLevelUps(newProfile, 0, newWorldSettings);
    
        const initialNpcs: NPC[] = (finalProfile.initialNpcs || []).map((newNpcData: NewNPCFromAI) => {
             const stats = calculateBaseStatsForLevel(newNpcData.level);
             return {
                ...newNpcData,
                experience: 0,
                health: stats.maxHealth,
                mana: stats.maxMana,
                realm: getRealmDisplayName(newNpcData.level, newNpcData.powerSystem, newWorldSettings),
                relationship: 0,
                memories: [],
                npcRelationships: newNpcData.npcRelationships || [],
                isDaoLu: false,
             };
        });
        
        setCharacterProfile(finalProfile);
        setWorldSettings(newWorldSettings);
        setNpcs(initialNpcs);
    
        try {
            const { storyResponse, usageMetadata } = await api.getInitialStory(finalProfile, newWorldSettings, settings.isMature, settings.perspective, apiKeyForService);
            
            const notifications: string[] = [];
            if (usageMetadata?.totalTokenCount) {
                notifications.push(`✨ Đã sử dụng <b>${usageMetadata.totalTokenCount.toLocaleString()} tokens</b> cho lượt này.`);
            }
            
            const initialStoryPart: StoryPart = { id: Date.now(), type: 'story', text: storyResponse.story, notifications };
            
            const preActionState = {
                characterProfile: finalProfile,
                worldSettings: newWorldSettings,
                npcs: initialNpcs,
                history: [],
                choices: [],
            };

            const firstSnapshot: GameSnapshot = {
                turnNumber: 1,
                preActionState,
                turnContent: {
                    storyResult: initialStoryPart,
                },
            };
            
            const initialHistory = [initialStoryPart];
            const initialChoices = storyResponse.choices;
            const initialGameLog: GameSnapshot[] = [firstSnapshot];
    
            setHistory(initialHistory);
            setChoices(initialChoices);
            setGameLog(initialGameLog);
            
            await saveService.saveGame(
                finalProfile,
                newWorldSettings,
                initialNpcs,
                initialHistory,
                initialChoices,
                initialGameLog
            );
    
            setGameState(GameState.PLAYING);
        } catch (e: any) {
            setError(`Lỗi khi bắt đầu câu chuyện: ${e.message}`);
            setGameState(GameState.ERROR);
        } finally {
            setIsLoading(false);
        }
    }, [api, apiKeyForService, settings.isMature, settings.perspective]);

    return {
        gameState, setGameState, hasSaves, characterProfile, setCharacterProfile, worldSettings, setWorldSettings, history, displayHistory, npcs, setNpcs, choices, gameLog, isLoading, error, settings,
        handleAction, handleContinue, handleGoHome, handleLoadGame, handleRestart, saveSettings, handleStartGame, handleUpdateLocation, handleUpdateWorldSettings, handleRewind, handleSave, handleUseItem
    };
};
