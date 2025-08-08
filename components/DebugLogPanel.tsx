import React, { useState, useEffect, useRef } from 'react';
import * as logService from '../services/logService';
import { LogEntry } from '../services/logService';

const LogTypeColors: Record<LogEntry['type'], string> = {
    RENDER: 'text-purple-400',
    API: 'text-cyan-400',
    STATE: 'text-yellow-400',
    FUNCTION: 'text-green-400',
    ERROR: 'text-red-500 font-bold',
    INFO: 'text-slate-300',
};

export const DebugLogPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [entries, setEntries] = useState(logService.getLogs());
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [size, setSize] = useState({ width: 500, height: 400 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleUpdate = () => setEntries([...logService.getLogs()]);
        const unsubscribe = logService.subscribe(handleUpdate);
        return unsubscribe;
    }, []);
    
    const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!panelRef.current) return;
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - panelRef.current.offsetLeft,
            y: e.clientY - panelRef.current.offsetTop,
        };
    };

    const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsResizing(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y,
            });
        }
        if (isResizing) {
            setSize(prevSize => ({
                width: Math.max(300, prevSize.width + e.movementX),
                height: Math.max(200, prevSize.height + e.movementY),
            }));
        }
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing]);


    return (
        <div
            ref={panelRef}
            className="fixed z-[100] bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg shadow-2xl flex flex-col"
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
             }}
        >
            <div
                onMouseDown={handleDragStart}
                className="flex-shrink-0 p-2 border-b border-slate-600 flex justify-between items-center cursor-move"
            >
                <h3 className="font-bold text-amber-300">Debug Log</h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => logService.clearLogs()} className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded">Clear</button>
                    <button onClick={onClose} className="text-xs px-2 py-1 bg-red-800 hover:bg-red-700 rounded">Close</button>
                </div>
            </div>
            <div className="flex-grow p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
                {entries.map(log => (
                    <div key={log.id} className="flex gap-2 text-xs font-mono border-b border-slate-700/50 py-1">
                        <span className="text-slate-500">{log.timestamp}</span>
                        <span className={`${LogTypeColors[log.type]} w-16 flex-shrink-0`}>[{log.type}]</span>
                        <span className="text-lime-400 w-48 flex-shrink-0 truncate" title={log.source}>{log.source}</span>
                        <span className="text-slate-200 flex-grow break-words">{log.message}</span>
                    </div>
                ))}
            </div>
            <div 
                onMouseDown={handleResizeStart}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize text-slate-500 hover:text-amber-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M4.005 4.005a.75.75 0 011.06 0l10.93 10.93a.75.75 0 11-1.06 1.06L4.005 5.065a.75.75 0 010-1.06z" /></svg>
            </div>
        </div>
    );
};
