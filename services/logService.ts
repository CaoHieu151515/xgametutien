
export interface LogEntry {
  id: number;
  timestamp: string;
  source: string;
  type: 'RENDER' | 'API' | 'STATE' | 'FUNCTION' | 'ERROR' | 'INFO' | 'PERF';
  message: string;
}

let logs: LogEntry[] = [];
let listeners: Array<() => void> = [];
let idCounter = 0;
const activeTimers: Record<string, number> = {};

const MAX_LOGS = 300; // Increased max logs to accommodate performance entries

export const log = (source: string, message: string, type: LogEntry['type'] = 'INFO') => {
  const newLog: LogEntry = {
    id: idCounter++,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 } as Intl.DateTimeFormatOptions),
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

export const startTimer = (key: string, source: string, message: string) => {
    activeTimers[key] = performance.now();
    log(source, `⏱️ Bắt đầu: ${message}`, 'PERF');
};

export const endTimer = (key: string, source: string, message?: string) => {
    const startTime = activeTimers[key];
    if (startTime) {
        const duration = performance.now() - startTime;
        const finalMessage = message ? `✅ Hoàn thành: ${message}` : `✅ Hoàn thành`;
        log(source, `${finalMessage} trong ${duration.toFixed(2)}ms`, 'PERF');
        delete activeTimers[key];
    } else {
        log(source, `⚠️ Lỗi hẹn giờ: Không tìm thấy key '${key}' để kết thúc.`, 'ERROR');
    }
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