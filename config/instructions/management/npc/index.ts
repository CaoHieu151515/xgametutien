import { WorldSettings, CharacterGender } from '../../../../types';
import { coreNpcRules } from './core.rules';
import { getNpcCreationRules } from './creation.rules';
import { getNpcUpdateRules } from './update.rules';
import { npcSpecialRules } from './special.rules';

export const getNpcManagementInstruction = (worldSettings: WorldSettings | null, playerGender: CharacterGender): string => {
    const powerSystemsList = worldSettings?.powerSystems?.map(ps => `- "${ps.name}"`).join('\n') || '- Không có hệ thống nào được định nghĩa.';
    const aptitudeTiersList = worldSettings?.aptitudeTiers?.split(' - ').map(tier => `- "${tier.trim()}"`).join('\n') || '- Không có tư chất nào được định nghĩa.';
    const daoLuTermPlayer = playerGender === CharacterGender.MALE ? 'Phu quân' : 'Thê tử';
    const playerGenderVietnamese = playerGender === CharacterGender.MALE ? 'Nam' : 'Nữ';

    const preamble = `
**QUY TẮC QUẢN LÝ NHÂN VẬT PHỤ (NPC) - SIÊU QUAN TRỌNG**

Để đảm bảo một thế giới sống động, logic và nhất quán, bạn PHẢI tuân thủ các quy tắc sau đây một cách tuyệt đối.
`;

    return [
        preamble,
        coreNpcRules,
        getNpcCreationRules(powerSystemsList, aptitudeTiersList),
        getNpcUpdateRules(daoLuTermPlayer, playerGenderVietnamese),
        npcSpecialRules
    ].join('\n\n');
};