import { AppSettings, CharacterGender, WorldSettings } from '../../types';
import { GAME_CONFIG } from '../gameConfig';

// System
import { masterInstruction } from './system/master.rules';
import { getBaseInstruction } from './system/base.rules';
import { playerDefinedRulesInstruction } from './system/playerDefined.rules';

// Gameplay
import { getCharacterInstruction } from './gameplay/character.rules';
import { getChoicesInstruction } from './gameplay/choices.rules';
import { statUpdatesInstruction } from './gameplay/statUpdates.rules';
import { getWorldInstruction } from './gameplay/world.rules';
import { creationInstruction } from './gameplay/creation.rules';
import { secretsAndReputationInstruction } from './gameplay/secrets.rules';

// Management
import { itemManagementInstruction } from './management/itemManagement.rules';
import { locationManagementInstruction } from './management/locationManagement.rules';
import { getNpcManagementInstruction } from './management/npcManagement.rules';
import { statusEffectManagementInstruction } from './management/statusEffectManagement.rules';
import { eventManagementInstruction } from './management/eventManagement.rules';

// Mature
import { matureContentInstruction } from './mature/matureContent.rules';
import { matureEventsInstruction } from './mature/matureEvents.rules';
import { bdsmScenariosInstruction } from './mature/bdsmScenarios.rules';


/**
 * Lấy chỉ thị hệ thống phù hợp dựa trên cài đặt của người chơi.
 * @param settings - Đối tượng cài đặt ứng dụng.
 * @param gender - Giới tính của nhân vật chính.
 * @param race - Chủng tộc của nhân vật chính.
 * @param powerSystem - Hệ thống sức mạnh của nhân vật chính.
 * @param worldSettings - Cài đặt thế giới.
 * @returns Chuỗi chỉ thị hệ thống hoàn chỉnh.
 */
export const getSystemInstruction = (    
    settings: AppSettings,
    gender: CharacterGender,
    race: string,
    powerSystem: string,
    worldSettings: WorldSettings | null
): string => {
    
    const { isMature, perspective, maxWordsPerTurn } = settings;
    const instructionParts = [
        masterInstruction,
        getBaseInstruction(maxWordsPerTurn),
        getCharacterInstruction(gender, perspective, race, powerSystem),
        getWorldInstruction(worldSettings),
        secretsAndReputationInstruction,
        getChoicesInstruction(GAME_CONFIG.ai.numberOfChoices),
        statUpdatesInstruction,
        statusEffectManagementInstruction,
        locationManagementInstruction,
        getNpcManagementInstruction(worldSettings, gender),
        itemManagementInstruction,
        eventManagementInstruction,
        creationInstruction,
        playerDefinedRulesInstruction
    ];

    if (isMature) {
        instructionParts.push(matureContentInstruction);
        instructionParts.push(matureEventsInstruction);
        instructionParts.push(bdsmScenariosInstruction);
    }
    
    // Nối các phần lại với nhau bằng hai dấu xuống dòng để dễ đọc hơn trong prompt
    return instructionParts.join('\n\n');
};