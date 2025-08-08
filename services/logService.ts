
export interface LogEntry {
  id: number;
  timestamp: string;
  source: string;
  type: 'RENDER' | 'API' | 'STATE' | 'FUNCTION' | 'ERROR' | 'INFO';
  message: string;
}

let logs: LogEntry[] = [];
let listeners: Array<() => void> = [];
let idCounter = 0;

const MAX_LOGS = 200;

export const log = (source: string, message: string, type: LogEntry['type'] = 'INFO') => {
  const newLog: LogEntry = {
    id: idCounter++,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    source,
    type,
    message
  };
  logs = [newLog, ...logs];
  if (logs.length > MAX_LOGS) {
    logs.pop();
  }
  // Notify listeners in a microtask to batch updates
  queueMicrotask(() => {
    listeners.forEach(l => l());
  });
};

export const getLogs = () => logs;

export const clearLogs = () => {
    logs = [];
    listeners.forEach(l => l());
}

export const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};
