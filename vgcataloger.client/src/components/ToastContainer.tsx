import type { Toast } from './useToast';

interface Props {
    toasts: Toast[];
    onDismiss: (id: number) => void;
}

export default function ToastContainer({ toasts, onDismiss }: Props) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast--${toast.type}`}>
                    <span>{toast.message}</span>
                    <button className="toast-close" onClick={() => onDismiss(toast.id)}>×</button>
                </div>
            ))}
        </div>
    );
}
