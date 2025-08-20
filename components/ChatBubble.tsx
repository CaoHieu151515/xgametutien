
import React from 'react';
import { CharacterGender } from '../types';
import { getDefaultAvatar } from '../utils/uiHelpers';

interface ChatBubbleProps {
    speakerName: React.ReactNode;
    speakerAvatar?: string;
    message: React.ReactNode;
    isPlayer: boolean;
    gender: CharacterGender;
    isGeneric?: boolean; // For gray bubbles
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ speakerName, speakerAvatar, message, isPlayer, gender, isGeneric }) => {
    
    let bubbleColorClass = '';
    if (isGeneric) {
        bubbleColorClass = 'bg-slate-700/80';
    } else if (gender === CharacterGender.MALE) {
        bubbleColorClass = 'bg-sky-800/60';
    } else {
        bubbleColorClass = 'bg-fuchsia-800/60';
    }
    
    const alignmentClass = isPlayer ? 'justify-end' : 'justify-start';
    const nameAlignmentClass = isPlayer ? 'text-right' : 'text-left';

    const avatar = <img src={speakerAvatar || getDefaultAvatar(gender)} alt={typeof speakerName === 'string' ? speakerName : 'avatar'} className="w-8 h-8 rounded-full object-cover flex-shrink-0" onError={(e) => { e.currentTarget.src = getDefaultAvatar(gender); }} />;

    return (
        <div className={`flex items-end gap-2 my-4 ${alignmentClass} animate-fade-in`}>
            {!isPlayer && avatar}
            <div className={`flex flex-col max-w-5xl ${isPlayer ? 'items-end' : 'items-start'}`}>
                <span className={`text-xs text-slate-400 mx-3 mb-1 ${nameAlignmentClass} whitespace-nowrap`}>{speakerName}</span>
                <div className={`p-3 text-white rounded-xl ${bubbleColorClass} break-words`} style={{ fontSize: 'var(--story-font-size)' }}>
                    {message}
                </div>
            </div>
            {isPlayer && avatar}
        </div>
    );
};
