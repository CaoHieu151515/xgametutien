import { NarrativePerspective, CharacterGender, WorldSettings } from '../../types';
import { GAME_CONFIG } from '../gameConfig';

// System
import { masterInstruction } from './system/master.rules';
import { baseInstruction } from './system/base.rules';
import { playerDefinedRulesInstruction } from './system/playerDefined.rules';

// Gameplay
import { getCharacterInstruction } from './gameplay/character.rules';
import { getChoicesInstruction } from './gameplay/choices.rules';
import { statUpdatesInstruction } from './gameplay/statUpdates.rules';
import { getWorldInstruction } from './gameplay/world.rules';
import { creationInstruction } from './gameplay/creation.rules';

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
 * @param isMature - Boolean cho biết có nên bao gồm các quy tắc nội dung người lớn hay không.
 * @param perspective - Ngôi kể chuyện được sử dụng.
 * @param gender - Giới tính của nhân vật chính.
 * @param race - Chủng tộc của nhân vật chính.
 * @param powerSystem - Hệ thống sức mạnh của nhân vật chính.
 * @param worldSettings - Cài đặt thế giới.
 * @returns Chuỗi chỉ thị hệ thống hoàn chỉnh.
 */
export const getSystemInstruction = (
    isMature: boolean,
    perspective: NarrativePerspective,
    gender: CharacterGender,
    race: string,
    powerSystem: string,
    worldSettings: WorldSettings | null
): string => {
    
    const instructionParts = [
        masterInstruction,
        baseInstruction,
        getCharacterInstruction(gender, perspective, race, powerSystem),
        getWorldInstruction(worldSettings),
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
