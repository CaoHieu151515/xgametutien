import { StoryResponse, CharacterProfile, NPC } from '../../types';

/**
 * Generates all user-facing notifications by comparing the AI response
 * with the original game state.
 * @param response The pre-processed story response from the AI.
 * @param originalStoryResponse The raw story response from the AI, used for pre-processing notifications.
 * @param originalProfile The character profile *before* this turn's changes.
 * @param originalNpcs The list of NPCs *before* this turn's changes.
 * @returns An array of notification strings (can contain HTML).
 */
export const generateNotifications = (
    response: StoryResponse,
    originalStoryResponse: StoryResponse,
    originalProfile: CharacterProfile,
    originalNpcs: NPC[]
): string[] => {
    const notifications: string[] = [];
    const allPossibleLocations = [...originalProfile.discoveredLocations, ...(response.newLocations || []), ...(response.updatedLocations || [])];

    // Pre-processing notifications
    if (originalStoryResponse.newLocations?.length) {
        const existingLocationNames = new Set(originalProfile.discoveredLocations.map(l => l.name.toLowerCase()));
        originalStoryResponse.newLocations.forEach(newLoc => {
            if (existingLocationNames.has(newLoc.name.toLowerCase())) {
                notifications.push(`ℹ️ Hệ thống đã bỏ qua việc tạo lại 1 địa điểm đã tồn tại: <b>${newLoc.name}</b>.`);
            }
        });
    }
    if (originalStoryResponse.newNPCs?.length) {
        const existingNpcNames = new Set(originalNpcs.map(n => n.name.toLowerCase()));
        originalStoryResponse.newNPCs.forEach(newNpc => {
            if (existingNpcNames.has(newNpc.name.toLowerCase())) {
                notifications.push(`ℹ️ Hệ thống đã bỏ qua việc tạo lại 1 NPC đã tồn tại: <b>${newNpc.name}</b>.`);
            }
        });
    }

    // Main notifications
    if (response.updatedStats?.currencyAmount) {
        const change = response.updatedStats.currencyAmount;
        const currencyName = originalProfile.currencyName || 'tiền';
        if (change > 0) {
            notifications.push(`💰 Bạn nhận được <b>${change.toLocaleString()} ${currencyName}</b>.`);
        } else if (change < 0) {
            notifications.push(`💸 Bạn đã tiêu <b>${Math.abs(change).toLocaleString()} ${currencyName}</b>.`);
        }
    }

    if (response.removedItemIds?.length) {
        response.removedItemIds.forEach(itemId => {
            const removedItem = originalProfile.items.find(i => i.id === itemId);
            if (removedItem) {
                notifications.push(`🎒 Đã sử dụng <b>[${removedItem.quality}] ${removedItem.name}</b> (x${removedItem.quantity}).`);
            }
        });
    }

    if (response.updatedItems?.length) {
        response.updatedItems.forEach(update => {
            const originalItem = originalProfile.items.find(i => i.name === update.name);
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

    if (response.updatedPlayerLocationId !== undefined && response.updatedPlayerLocationId !== originalProfile.currentLocationId) {
        let newLocName = 'Không Gian Hỗn Độn';
        if (response.updatedPlayerLocationId !== null) {
            const newLoc = allPossibleLocations.find(l => l.id === response.updatedPlayerLocationId);
            if (newLoc) newLocName = newLoc.name;
        }
        notifications.push(`🚶 Bạn đã di chuyển đến <b>${newLocName}</b>.`);
    }

    if (response.updatedNPCs?.length) {
        response.updatedNPCs.forEach(update => {
            const originalNpc = originalNpcs.find(n => n.id === update.id);
            if (!originalNpc) return;
    
            if (update.specialConstitution && (!originalNpc.specialConstitution || originalNpc.specialConstitution.name !== update.specialConstitution.name)) {
                notifications.push(`🌟 <b>${originalNpc.name}</b> đã thức tỉnh thể chất đặc biệt: <b>${update.specialConstitution.name}</b>!`);
            }
    
            if (update.innateTalent && (!originalNpc.innateTalent || originalNpc.innateTalent.name !== update.innateTalent.name)) {
                notifications.push(`🌟 <b>${originalNpc.name}</b> đã thức tỉnh thiên phú bẩm sinh: <b>${update.innateTalent.name}</b>!`);
            }
             if (update.newlyLearnedSkills?.length) {
                update.newlyLearnedSkills.forEach(skill => {
                    notifications.push(`📖 <b>${originalNpc.name}</b> đã học được kỹ năng mới: <b>${skill.name}</b>!`);
                });
            }
        });
    }

    return notifications;
};