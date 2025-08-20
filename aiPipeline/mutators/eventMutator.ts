import { StoryResponse, CharacterProfile, GameEvent } from '../../types';

interface ApplyEventMutationsParams {
    response: StoryResponse;
    profile: CharacterProfile;
    isSuccess: boolean;
    turnNumber: number;
    notifications: string[];
}

export const applyEventMutations = ({
    response,
    profile,
    isSuccess,
    turnNumber,
    notifications,
}: ApplyEventMutationsParams): CharacterProfile => {
    if (!isSuccess) {
        return profile;
    }

    let nextProfile = { ...profile };
    let events = [...(nextProfile.events || [])];

    if (response.newEvent) {
        const { title, description, initialLog, rewards } = response.newEvent;
        const newEvent: GameEvent = {
            id: `event_${Date.now()}`,
            title,
            description,
            status: 'active',
            log: [{ turnNumber, entry: initialLog }],
            rewards,
            isNew: true,
        };
        events.push(newEvent);
        notifications.push(`📜 Nhiệm vụ mới: <b>${title}</b> đã được thêm vào nhật ký.`);
    }

    if (response.updateEventLog) {
        const { eventId, logEntry } = response.updateEventLog;
        let eventTitle = '';
        events = events.map(event => {
            if (event.id === eventId) {
                eventTitle = event.title;
                return {
                    ...event,
                    log: [...event.log, { turnNumber, entry: logEntry }],
                    isNew: true,
                };
            }
            return event;
        });
        if (eventTitle) {
            notifications.push(`📜 Nhiệm vụ "<b>${eventTitle}</b>" đã được cập nhật.`);
        }
    }

    if (response.completeEvent) {
        const { eventId, finalLog } = response.completeEvent;
        let eventTitle = '';
        events = events.map(event => {
            if (event.id === eventId) {
                eventTitle = event.title;
                return {
                    ...event,
                    status: 'completed',
                    log: [...event.log, { turnNumber, entry: finalLog }],
                    isNew: false,
                };
            }
            return event;
        });
        if (eventTitle) {
            notifications.push(`✅ Nhiệm vụ "<b>${eventTitle}</b>" đã hoàn thành!`);
        }
    }

    nextProfile.events = events;
    return nextProfile;
};
