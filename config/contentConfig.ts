
import { NarrativePerspective, CharacterGender, WorldSettings } from '../types';
import { baseInstruction } from './instructions/base';
import { getCharacterInstruction } from './instructions/character';
import { choicesInstruction } from './instructions/choices';
import { itemManagementInstruction } from './instructions/itemManagement';
import { locationManagementInstruction } from './instructions/locationManagement';
import { matureContentInstruction } from './instructions/matureContent';
import { getNpcManagementInstruction } from './instructions/npcManagement';
import { playerDefinedRulesInstruction } from './instructions/playerDefinedRules';
import { statUpdatesInstruction } from './instructions/statUpdates';
import { getWorldInstruction } from './instructions/world';
import { creationInstruction } from './instructions/creation';

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
        baseInstruction,
        getCharacterInstruction(gender, perspective, race, powerSystem),
        getWorldInstruction(worldSettings),
        choicesInstruction,
        statUpdatesInstruction,
        locationManagementInstruction,
        getNpcManagementInstruction(worldSettings, gender),
        itemManagementInstruction,
        creationInstruction,
        playerDefinedRulesInstruction
    ];

    if (isMature) {
        instructionParts.push(matureContentInstruction);
    }
    
    // Nối các phần lại với nhau bằng hai dấu xuống dòng để dễ đọc hơn trong prompt
    return instructionParts.join('\n\n');
};
