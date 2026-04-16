import { useState, useCallback } from 'react';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

let nextId = 0;

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
        const id = ++nextId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, showToast, dismiss };
}
