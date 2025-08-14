import React, { useEffect, useRef, useMemo, useState } from 'react';
import { StoryPart, CharacterProfile, WorldSettings, NPC, CharacterGender } from '../types';
import { ChatBubble } from './ChatBubble';

const NewBadge = () => <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 bg-yellow-300 rounded-full">NEW</span>;

const KeywordTooltip: React.FC<{ keyword: string; description: string; isNew?: boolean }> = ({ keyword, description, isNew }) => {
  const [show, setShow] = useState(false);
  const [verticalPosition, setVerticalPosition] = useState<'top' | 'bottom'>('top');
  const [horizontalAlign, setHorizontalAlign] = useState<'center' | 'left' | 'right'>('center');
  const ref = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // This effect ensures that if the user scrolls, any open tooltip will be closed.
    // This improves user experience and prevents rendering glitches on some browsers.
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
  }, [show]); // Re-run this effect whenever the 'show' state changes.

  const handlePositionCalculation = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      
      // Estimate tooltip height to decide whether to show it above or below.
      const estimatedTooltipHeight = 150; 
      if (rect.top < estimatedTooltipHeight) { 
        setVerticalPosition('bottom');
      } else {
        setVerticalPosition('top');
      }

      // Horizontal positioning to avoid viewport overflow
      const tooltipWidth = 288; // from w-72 class
      const viewportWidth = window.innerWidth;
      const margin = 16; // 1rem screen padding

      const keywordCenter = rect.left + rect.width / 2;

      if (keywordCenter + tooltipWidth / 2 > viewportWidth - margin) {
          // overflows right, so align to the right of the keyword
          setHorizontalAlign('right');
      } else if (keywordCenter - tooltipWidth / 2 < margin) {
          // overflows left, so align to the left of the keyword
          setHorizontalAlign('left');
      } else {
          // it fits, so center it
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
      // Recalculate position on click as well, for mobile devices
      handlePositionCalculation();
      setShow(s => !s);
  }

  const getPositionClasses = () => {
      let classes = 'absolute z-30';
      // Vertical
      classes += verticalPosition === 'top' ? ' bottom-full mb-2' : ' top-full mt-2';
      // Horizontal
      if (horizontalAlign === 'center') {
          classes += ' left-1/2 -translate-x-1/2';
      } else if (horizontalAlign === 'left') {
          classes += ' left-0';
      } else { // 'right'
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
          <p className="whitespace-pre-wrap break-words">{description}</p>
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
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ history, characterProfile, worldSettings, npcs }) => {
  const storyContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // When a new turn starts, scroll to the top of the story display.
    storyContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [history]);

  const keywords = useMemo((): Keyword[] => {
    if (!characterProfile || !worldSettings) return [];
    
    const allKeywords: Keyword[] = [];

    // NPCs
    npcs.forEach(npc => {
        allKeywords.push({ keyword: npc.name, description: npc.description, isNew: npc.isNew });
        if (npc.aliases) {
            npc.aliases.split(',').forEach(alias => {
                if (alias.trim()) {
                    allKeywords.push({ keyword: alias.trim(), description: npc.description, isNew: false });
                }
            });
        }
    });

    // Locations
    characterProfile.discoveredLocations.forEach(loc => {
        allKeywords.push({ keyword: loc.name, description: loc.description, isNew: loc.isNew });
    });

    // Skills
    characterProfile.skills.forEach(skill => {
        allKeywords.push({ keyword: skill.name, description: skill.description, isNew: skill.isNew });
    });

    // World Knowledge
    worldSettings.initialKnowledge.forEach(k => {
        allKeywords.push({ keyword: k.title, description: k.content, isNew: k.isNew });
    });

    // Items (from discoveredItems for encyclopedia-style highlighting)
    (characterProfile.discoveredItems || []).forEach(item => {
        allKeywords.push({ keyword: item.name, description: item.description, isNew: item.isNew });
    });

    // Monsters
    characterProfile.discoveredMonsters.forEach(monster => {
        allKeywords.push({ keyword: monster.name, description: `Sinh vật: ${monster.description}`, isNew: monster.isNew });
    });

    // Player special abilities
    if (characterProfile.specialConstitution.name) {
        allKeywords.push({ keyword: characterProfile.specialConstitution.name, description: `Thể chất: ${characterProfile.specialConstitution.description}` });
    }
    if (characterProfile.talent.name) {
        allKeywords.push({ keyword: characterProfile.talent.name, description: `Thiên phú: ${characterProfile.talent.description}` });
    }

    // Player name
    allKeywords.push({ keyword: characterProfile.name, description: "Đây là bạn!" });

    return allKeywords;
  }, [characterProfile, worldSettings, npcs]);

    const renderedNewKeywordsThisTurn = new Set<string>();

    const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const linkifyStory = (text: string): React.ReactNode => {
        if (!text) return text;

        const sortedKeywords = keywords
            .filter(k => k.keyword && k.keyword.trim() !== "")
            .sort((a, b) => b.keyword.length - a.keyword.length);
    
        const keywordRegexPart = sortedKeywords.length > 0
            ? sortedKeywords.map(k => escapeRegExp(k.keyword)).join('|')
            : null;

        if (!keywordRegexPart && !text.includes('[[')) {
            return text;
        }

        const newNounPattern = '\\[\\[[^\\]]+\\]\\]';
        let finalPattern = newNounPattern;
        if (keywordRegexPart) {
            finalPattern = `${newNounPattern}|${keywordRegexPart}`;
        }
        
        // The key fix is to use a single capturing group for all patterns.
        // This ensures the array from .split() is clean and doesn't contain `undefined` values,
        // which was causing rendering glitches with inline elements.
        const combinedRegex = new RegExp(`(${finalPattern})`, 'g');

        const parts = text.split(combinedRegex);
        
        return parts.map((part, index) => {
            if (!part) return null;
    
            // Check if it's a new noun, e.g., [[Lý Hàn Thiên]]
            if (part.startsWith('[[') && part.endsWith(']]')) {
                const content = part.substring(2, part.length - 2);
                
                // Cross-check if this "new" noun is actually a known keyword.
                const knownKeywordData = sortedKeywords.find(k => k.keyword === content);
                if (knownKeywordData) {
                    // It is a known keyword that the AI mistakenly marked as new. Render it correctly.
                     let showNewBadge = false;
                    if (knownKeywordData.isNew && !renderedNewKeywordsThisTurn.has(knownKeywordData.keyword)) {
                        showNewBadge = true;
                        renderedNewKeywordsThisTurn.add(knownKeywordData.keyword);
                    }
                    return <KeywordTooltip key={index} keyword={knownKeywordData.keyword} description={knownKeywordData.description} isNew={showNewBadge} />;
                } else {
                    // It is a genuinely new noun.
                    return <span key={index} className="font-semibold text-cyan-400 border-b border-cyan-400/50 border-dotted">{content}</span>;
                }
            }
    
            // Check if it's a known keyword
            const keywordData = sortedKeywords.find(k => k.keyword === part);
            if (keywordData) {
                let showNewBadge = false;
                if (keywordData.isNew && !renderedNewKeywordsThisTurn.has(keywordData.keyword)) {
                    showNewBadge = true;
                    renderedNewKeywordsThisTurn.add(keywordData.keyword);
                }
                return <KeywordTooltip key={index} keyword={keywordData.keyword} description={keywordData.description} isNew={showNewBadge} />;
            }
            
            // It's plain text
            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    };

    const renderStoryPart = (part: StoryPart) => {
        if (!characterProfile) return null;
    
        const dialogueCaptureRegex = /(\s*\[[^\]]+\][:：]\s*["“].*?["”]\s*)/g;
        const dialogueExtractRegex = /^\s*\[([^\]]+)\][:：]\s*["“](.*?)["”]\s*$/;
    
        // Process the entire text block at once to handle mixed dialogue and narration.
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
  
                        // Check for NEW/MỚI tag in speaker name
                        const newTagRegex = /\s+(?:NEW|MỚI)\s*$/i;
                        const hasNewTag = newTagRegex.test(speakerNameWithTags);
                        const speakerName = speakerNameWithTags.replace(newTagRegex, '').trim();
                        const speakerDisplayName = <>{speakerName}{hasNewTag && <NewBadge />}</>;
                        
                        if (speakerName === characterProfile.name) {
                            return (
                                <ChatBubble 
                                    key={`${part.id}-${segmentIndex}`} 
                                    speakerName={speakerDisplayName}
                                    speakerAvatar={characterProfile.avatarUrl}
                                    message={linkifyStory(message)} 
                                    isPlayer={true}
                                    gender={characterProfile.gender}
                                />
                            );
                        }
                        
                        const npc = npcs.find(n => n.name === speakerName || n.aliases?.includes(speakerName));
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
                        
                        // Generic speaker (gray bubble)
                        return (
                            <ChatBubble 
                                key={`${part.id}-${segmentIndex}`} 
                                speakerName={speakerDisplayName}
                                message={linkifyStory(message)} 
                                isPlayer={false}
                                gender={CharacterGender.MALE} // does not matter for generic
                                isGeneric={true}
                            />
                        );
            
                    } else {
                        // This segment is narration. Split it into paragraphs.
                        const paragraphs = segment.trim().split(/\n\s*\n+/).filter(p => p.trim());
                        return (
                            <React.Fragment key={`${part.id}-${segmentIndex}`}>
                                {paragraphs.map((paragraph, paragraphIndex) => {
                                    // Filter out empty speaker tags like "[Tu sĩ A]:"
                                    if (/^\s*\[[^\]]+\][:：]\s*$/.test(paragraph)) {
                                        return null;
                                    }
                                    return (
                                        <p
                                            key={`${part.id}-${segmentIndex}-${paragraphIndex}`}
                                            className="text-slate-300 my-4 animate-fade-in break-words"
                                            style={{ fontSize: 'var(--story-font-size)' }}
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

  return (
    <div ref={storyContainerRef} className="flex-grow min-h-0 overflow-y-auto p-6 md:p-8 custom-scrollbar">
      {history.map((part) => (
        <div key={part.id}>
          {part.type === 'story' ? (
            <>
              {renderStoryPart(part)}
              {part.notifications && part.notifications.length > 0 && (
                <NotificationBlock notifications={part.notifications} />
              )}
            </>
          ) : (
            <p className="font-sans text-amber-400 italic text-right border-t border-slate-700 pt-4 mt-4 animate-fade-in break-words" style={{ fontSize: 'var(--story-font-size-large)' }}>
              &gt; {linkifyStory(part.text)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
