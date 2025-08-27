
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { StoryPart, CharacterProfile, WorldSettings, NPC, CharacterGender, Identity } from '../types';
import { ChatBubble } from './ChatBubble';

const NewBadge = () => <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 bg-yellow-300 rounded-full">NEW</span>;

const KeywordTooltip: React.FC<{ keyword: string; description: string; isNew?: boolean }> = ({ keyword, description, isNew }) => {
  const [show, setShow] = useState(false);
  const [verticalPosition, setVerticalPosition] = useState<'top' | 'bottom'>('top');
  const [horizontalAlign, setHorizontalAlign] = useState<'center' | 'left' | 'right'>('center');
  const ref = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!show) {
      return;
    }

    const handleScroll = () => {
      setShow(false);
    };

    const scrollContainer = ref.current?.closest('.custom-scrollbar');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [show]);

  const handlePositionCalculation = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      
      const estimatedTooltipHeight = 150; 
      if (rect.top < estimatedTooltipHeight) { 
        setVerticalPosition('bottom');
      } else {
        setVerticalPosition('top');
      }

      const tooltipWidth = 288;
      const viewportWidth = window.innerWidth;
      const margin = 16;

      const keywordCenter = rect.left + rect.width / 2;

      if (keywordCenter + tooltipWidth / 2 > viewportWidth - margin) {
          setHorizontalAlign('right');
      } else if (keywordCenter - tooltipWidth / 2 < margin) {
          setHorizontalAlign('left');
      } else {
          setHorizontalAlign('center');
      }
    }
  };

  const handleMouseEnter = () => {
    handlePositionCalculation();
    setShow(true);
  };
  
  const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handlePositionCalculation();
      setShow(s => !s);
  }

  const getPositionClasses = () => {
      let classes = 'absolute z-30';
      classes += verticalPosition === 'top' ? ' bottom-full mb-2' : ' top-full mt-2';
      if (horizontalAlign === 'center') {
          classes += ' left-1/2 -translate-x-1/2';
      } else if (horizontalAlign === 'left') {
          classes += ' left-0';
      } else {
          classes += ' right-0';
      }
      return classes;
  };
    
  const keywordClasses = "font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer";

  return (
    <span 
      ref={ref}
      className="relative inline align-baseline"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
      onClick={handleClick}
    >
      <span className={keywordClasses}>
        {keyword}
      </span>
      {isNew && <NewBadge />}
      {show && (
        <div 
            className={`${getPositionClasses()} w-72 p-3 bg-slate-900 border border-slate-600 rounded-lg shadow-lg text-sm text-slate-200 animate-fade-in`}
            style={{ pointerEvents: 'none' }}
        >
          <p className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: description }}></p>
        </div>
      )}
    </span>
  );
};

interface Keyword {
    keyword: string;
    description: string;
    isNew?: boolean;
}

const NotificationBlock: React.FC<{ notifications: string[] }> = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-slate-800/60 border border-slate-700 rounded-lg mt-6 mb-4 animate-fade-in">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-slate-200">Thông báo lượt này</h3>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-700/50">
          <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-sm">
            {notifications.map((note, index) => (
              <li key={index} className="break-words" dangerouslySetInnerHTML={{ __html: note }}></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


interface StoryDisplayProps {
  history: StoryPart[];
  characterProfile: CharacterProfile | null;
  worldSettings: WorldSettings | null;
  npcs: NPC[];
  onUpdateBackgroundAvatars: (urls: string[]) => void;
  activeIdentity: Identity | null;
}

const formatLongNarration = (text: string): string => {
    if (text.includes('\n\n') || text.length < 400) {
        return text;
    }
    const sentences = text.match(/[^.!?]+[.!?]("|”|\s)*/g);
    if (!sentences || sentences.length <= 3) {
        return text;
    }
    const paragraphs: string[] = [];
    const sentencesPerParagraph = Math.min(4, Math.max(2, Math.ceil(sentences.length / 4)));
    for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
        const chunk = sentences.slice(i, i + sentencesPerParagraph);
        paragraphs.push(chunk.join(' ').trim());
    }
    return paragraphs.join('\n\n');
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ history, characterProfile, worldSettings, npcs, onUpdateBackgroundAvatars, activeIdentity }) => {
    const storyContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        storyContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [history]);

    useEffect(() => {
        if (!history.length || !characterProfile) {
            onUpdateBackgroundAvatars([]);
            return;
        }

        const lastPart = history[history.length - 1];

        if (lastPart.type === 'action') {
            onUpdateBackgroundAvatars([]);
            return;
        }

        const speakerRegex = /\[([^\]]+?)\][:：]/g;
        const matches = [...lastPart.text.matchAll(speakerRegex)];
        
        if (matches.length === 0) {
            onUpdateBackgroundAvatars([]);
            return;
        }
        
        const playerName = activeIdentity ? activeIdentity.name : characterProfile.name;
        const speakerNames = new Set(matches.map(match => match[1].trim()));
        speakerNames.delete(playerName);
        
        const avatarUrls = Array.from(speakerNames)
          .map(name => {
            const cleanName = name.replace(/\s+(?:NEW|MỚI)\s*$/i, '').trim();
            return npcs.find(npc => npc.name === cleanName || npc.aliases?.includes(cleanName));
          })
          .filter((npc): npc is NPC => !!npc && !!npc.avatarUrl)
          .map(npc => npc.avatarUrl as string);
          
        const uniqueUrls = [...new Set(avatarUrls)];
        onUpdateBackgroundAvatars(uniqueUrls.slice(0, 3));

    }, [history, npcs, characterProfile, onUpdateBackgroundAvatars, activeIdentity]);

    const keywords = useMemo((): Keyword[] => {
        if (!characterProfile || !worldSettings) return [];
        
        const allKeywords: Keyword[] = [];

        // Player name (dynamic)
        const playerName = activeIdentity ? activeIdentity.name : characterProfile.name;
        const playerDescription = activeIdentity
            ? `[Nhân Dạng] ${activeIdentity.backstory || 'Đây là bạn dưới một vỏ bọc khác.'}`
            : `[Nhân vật chính] ${characterProfile.backstory || 'Đây là bạn.'}`;
        allKeywords.push({ keyword: playerName, description: playerDescription });


        // Player special abilities
        if (characterProfile.specialConstitution.name) {
            allKeywords.push({ keyword: characterProfile.specialConstitution.name, description: `[Thể chất] ${characterProfile.specialConstitution.description}` });
        }
        if (characterProfile.talent.name) {
            allKeywords.push({ keyword: characterProfile.talent.name, description: `[Thiên phú] ${characterProfile.talent.description}` });
        }

        // NPCs
        npcs.forEach(npc => {
            const npcDescription = `<b>[NPC | Cảnh giới: ${npc.realm}]</b><br>${npc.description}`;
            allKeywords.push({ keyword: npc.name, description: npcDescription, isNew: npc.isNew });
            if (npc.aliases) {
                npc.aliases.split(',').forEach(alias => {
                    if (alias.trim()) {
                        allKeywords.push({ keyword: alias.trim(), description: npcDescription, isNew: false });
                    }
                });
            }
        });

        // Locations
        characterProfile.discoveredLocations.forEach(loc => {
            allKeywords.push({ keyword: loc.name, description: `[Địa Điểm] ${loc.description}`, isNew: loc.isNew });
        });

        // Skills
        characterProfile.skills.forEach(skill => {
            allKeywords.push({ keyword: skill.name, description: `[Kỹ Năng] ${skill.description}`, isNew: skill.isNew });
        });

        // World Knowledge & Factions
        worldSettings.initialKnowledge.forEach(k => {
            allKeywords.push({ keyword: k.title, description: `[Tri Thức] ${k.content}`, isNew: k.isNew });
        });

        // Items
        (characterProfile.discoveredItems || []).forEach(item => {
            allKeywords.push({ keyword: item.name, description: `[Vật Phẩm] ${item.description}`, isNew: item.isNew });
        });

        // Monsters
        characterProfile.discoveredMonsters.forEach(monster => {
            allKeywords.push({ keyword: monster.name, description: `[Sinh Vật] ${monster.description}`, isNew: monster.isNew });
        });

        // Achievements
        (characterProfile.achievements || []).forEach(achievement => {
            const description = `[Thành Tích] ${achievement.description}${achievement.tier ? ` (Bậc: ${achievement.tier})` : ''}`;
            allKeywords.push({ keyword: achievement.name, description: description, isNew: achievement.isNew });
        });

        return allKeywords;
    }, [characterProfile, worldSettings, npcs, activeIdentity]);

    const renderedNewKeywordsThisTurn = useRef(new Set<string>());
    
    useEffect(() => {
        renderedNewKeywordsThisTurn.current.clear();
    }, [history.length]);

    const linkifyStory = (text: string): React.ReactNode[] => {
        if (!text) return [];

        const sortedKeywords = keywords
            .filter(k => k.keyword && k.keyword.trim().length > 1)
            .sort((a, b) => b.keyword.length - a.keyword.length);
    
        const keywordRegexPart = sortedKeywords.length > 0
            ? sortedKeywords.map(k => escapeRegExp(k.keyword)).join('|')
            : null;

        const newNounPattern = '\\[\\[[^\\]]+\\]\\]';
        let finalPattern = newNounPattern;
        if (keywordRegexPart) {
            // Removed word boundaries (\b) to correctly match multi-word Vietnamese keywords.
            // The descending sort by length prevents partial matches of shorter keywords.
            finalPattern = `${newNounPattern}|(?:${keywordRegexPart})`;
        }
        
        const combinedRegex = new RegExp(`(${finalPattern})`, 'gi');
        const parts = text.split(combinedRegex);
        
        return parts.map((part, index) => {
            if (!part) return null;
    
            if (part.startsWith('[[') && part.endsWith(']]')) {
                const content = part.substring(2, part.length - 2);
                const knownKeywordData = sortedKeywords.find(k => k.keyword.toLowerCase() === content.toLowerCase());
                if (knownKeywordData) {
                    let showNewBadge = false;
                    if (knownKeywordData.isNew && !renderedNewKeywordsThisTurn.current.has(knownKeywordData.keyword)) {
                        showNewBadge = true;
                        renderedNewKeywordsThisTurn.current.add(knownKeywordData.keyword);
                    }
                    return <KeywordTooltip key={`${part}-${index}`} keyword={content} description={knownKeywordData.description} isNew={showNewBadge} />;
                } else {
                    return <span key={`${part}-${index}`} className="font-semibold text-cyan-400 border-b border-cyan-400/50 border-dotted">{content}</span>;
                }
            }
    
            const keywordData = sortedKeywords.find(k => k.keyword.toLowerCase() === part.toLowerCase());
            if (keywordData) {
                let showNewBadge = false;
                if (keywordData.isNew && !renderedNewKeywordsThisTurn.current.has(keywordData.keyword)) {
                    showNewBadge = true;
                    renderedNewKeywordsThisTurn.current.add(keywordData.keyword);
                }
                return <KeywordTooltip key={`${part}-${index}`} keyword={part} description={keywordData.description} isNew={showNewBadge} />;
            }
            
            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    };

    const renderStoryPart = (part: StoryPart) => {
        if (!characterProfile) return null;
    
        const dialogueCaptureRegex = /(\s*\[[^\]]+?\][:：]\s*(?:\(.*\))?\s*["“].*?["”]\s*)/g;
        const dialogueExtractRegex = /^\s*\[([^\]]+?)\][:：]\s*(?:\(.*\))?\s*["“](.*?)["”]\s*$/;
    
        const segments = part.text.split(dialogueCaptureRegex);
    
        return (
            <div key={part.id} className="flex flex-col">
                {segments.map((segment, segmentIndex) => {
                    if (!segment || segment.trim() === '') {
                        return null;
                    }
                    
                    const dialogueMatch = segment.match(dialogueExtractRegex);
  
                    if (dialogueMatch) {
                        const speakerNameWithTags = dialogueMatch[1].trim();
                        const message = dialogueMatch[2];
  
                        const newTagRegex = /\s+(?:NEW|MỚI)\s*$/i;
                        const hasNewTag = newTagRegex.test(speakerNameWithTags);
                        const speakerName = speakerNameWithTags.replace(newTagRegex, '').trim();
                        const speakerDisplayName = <>{speakerName}{hasNewTag && <NewBadge />}</>;
                        
                        const playerName = activeIdentity ? activeIdentity.name : characterProfile.name;
                        if (speakerName.toLowerCase() === playerName.toLowerCase()) {
                            return (
                                <ChatBubble 
                                    key={`${part.id}-${segmentIndex}`} 
                                    speakerName={speakerDisplayName}
                                    speakerAvatar={activeIdentity?.imageUrl || characterProfile.avatarUrl}
                                    message={linkifyStory(message)} 
                                    isPlayer={true}
                                    gender={activeIdentity ? activeIdentity.gender : characterProfile.gender}
                                />
                            );
                        }
                        
                        const npc = npcs.find(n => n.name.toLowerCase() === speakerName.toLowerCase() || n.aliases?.toLowerCase().split(',').map(a => a.trim()).includes(speakerName.toLowerCase()));
                        if (npc) {
                            return (
                                <ChatBubble 
                                    key={`${part.id}-${segmentIndex}`} 
                                    speakerName={speakerDisplayName}
                                    speakerAvatar={npc.avatarUrl}
                                    message={linkifyStory(message)} 
                                    isPlayer={false}
                                    gender={npc.gender}
                                />
                            );
                        }
                        
                        return (
                            <ChatBubble 
                                key={`${part.id}-${segmentIndex}`} 
                                speakerName={speakerDisplayName}
                                message={linkifyStory(message)} 
                                isPlayer={false}
                                gender={CharacterGender.MALE}
                                isGeneric={true}
                            />
                        );
            
                    } else {
                        const formattedSegment = formatLongNarration(segment);
                        const paragraphs = formattedSegment.trim().split(/\n\s*\n+/).filter(p => p.trim());
                        return (
                            <React.Fragment key={`${part.id}-${segmentIndex}`}>
                                {paragraphs.map((paragraph, paragraphIndex) => {
                                    if (/^\s*\[[^\]]+\][:：]\s*$/.test(paragraph)) {
                                        return null;
                                    }
                                    return (
                                        <p
                                            key={`${part.id}-${segmentIndex}-${paragraphIndex}`}
                                            className="text-slate-300 my-4 animate-fade-in break-words whitespace-pre-wrap"
                                            style={{ fontSize: 'var(--story-font-size-xl)' }}
                                        >
                                            {linkifyStory(paragraph)}
                                        </p>
                                    );
                                })}
                            </React.Fragment>
                        );
                    }
                })}
            </div>
        );
    };

    const currentTurnHistory = useMemo(() => {
        if (history.length === 0) {
            return [];
        }
        // This logic ensures only the latest story part is displayed, hiding the preceding
        // player action to keep the UI clean, as requested.
        // It finds the last element of type 'story' and displays only that.
        // If there's no story part yet (e.g., initial state), it shows nothing.
        const lastStoryPart = history.slice().reverse().find(p => p.type === 'story');
        return lastStoryPart ? [lastStoryPart] : [];
    }, [history]);

    return (
        <div ref={storyContainerRef} className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 md:p-8">
            {currentTurnHistory.map((part) => (
                <div key={part.id}>
                    {part.type === 'story' ? (
                        <>
                            {renderStoryPart(part)}
                            {part.notifications && part.notifications.length > 0 && (
                                <NotificationBlock notifications={part.notifications} />
                            )}
                        </>
                    ) : (
                        // This block for rendering 'action' type is now effectively unused
                        // due to the change in `currentTurnHistory`, but is kept for structural integrity.
                        <p className="font-sans text-amber-400 italic text-right border-t border-slate-700 pt-4 mt-4 animate-fade-in break-words" style={{ fontSize: 'var(--story-font-size-large)' }}>
                            &gt; {linkifyStory(part.text)}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};