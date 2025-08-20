import { useState, useCallback } from 'react';
import { ToastMessage } from '../../types';

export const useNotificationLogic = () => {
    const [toast, setToast] = useState<ToastMessage | null>(null);

    const clearToast = useCallback(() => setToast(null), []);

    return { toast, setToast, clearToast };
};
