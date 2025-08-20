import React, { useState, useMemo } from 'react';
import { GameEvent, Item } from '../../types';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: GameEvent[];
}

const NewBadge = () => <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 bg-yellow-300 rounded-full">NEW</span>;

const formatRewardItem = (item: Item) => {
    return `${item.name} (Phẩm chất: ${item.quality}) x${item.quantity}`;
};

const EventDetails: React.FC<{ event: GameEvent }> = ({ event }) => (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 space-y-4">
        <h3 className="text-xl font-bold text-amber-300 flex items-center">
            {event.title}
            {event.isNew && <NewBadge />}
        </h3>
        <p className="text-sm text-slate-400 border-b border-slate-700/50 pb-3">{event.description}</p>
        
        {event.rewards && (
            <div>
                <h4 className="font-semibold text-slate-200 mb-2">Phần thưởng dự kiến:</h4>
                <ul className="list-disc list-inside text-sm text-green-300 space-y-1">
                    {event.rewards.experience && <li>{event.rewards.experience.toLocaleString()} EXP</li>}
                    {event.rewards.currency && <li>{event.rewards.currency.toLocaleString()} Tiền tệ</li>}
                    {(event.rewards.items || []).map((item, index) => (
                        <li key={index}>{formatRewardItem(item)}</li>
                    ))}
                </ul>
            </div>
        )}

        <div>
            <h4 className="font-semibold text-slate-200 mb-2">Nhật ký sự kiện:</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {event.log.map((entry, index) => (
                    <div key={index} className="flex gap-4 text-sm">
                        <span className="font-bold text-slate-500 w-16 text-right flex-shrink-0">Lượt {entry.turnNumber}</span>
                        <p className="text-slate-300 border-l-2 border-slate-700 pl-4">{entry.entry}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, events }) => {
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    
    const { activeEvents, completedEvents } = useMemo(() => {
        const active = [...(events || []).filter(e => e.status === 'active')].reverse();
        const completed = [...(events || []).filter(e => e.status === 'completed')].reverse();
        return { activeEvents: active, completedEvents: completed };
    }, [events]);

    if (!isOpen) {
        return null;
    }

    const eventsToShow = activeTab === 'active' ? activeEvents : completedEvents;

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 px-6 py-4 flex justify-between items-center border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-amber-300">Nhiệm Vụ & Sự Kiện</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Đóng">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-shrink-0 px-4 border-b border-slate-700">
                    <nav className="flex space-x-1">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none ${activeTab === 'active' ? 'border-b-2 border-amber-400 text-amber-300' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Đang Diễn Ra ({activeEvents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none ${activeTab === 'completed' ? 'border-b-2 border-amber-400 text-amber-300' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Đã Hoàn Thành ({completedEvents.length})
                        </button>
                    </nav>
                </div>
                
                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {eventsToShow.length > 0 ? (
                        eventsToShow.map(event => <EventDetails key={event.id} event={event} />)
                    ) : (
                        <div className="text-center py-16 text-slate-500">
                            <p>Không có nhiệm vụ nào trong mục này.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};