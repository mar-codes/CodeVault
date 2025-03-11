import { toast } from 'react-hot-toast';

export const toastStyles = {
    style: {
        background: '#1f2937',
        color: '#fff',
        border: '1px solid rgba(75, 85, 99, 0.3)',
    },
    success: {
        icon: '✓',
        style: {
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#fff',
        },
    },
    error: {
        icon: '✕',
        style: {
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fff',
        },
    },
};

export const showToast = {
    success: (message) => toast.success(message, toastStyles.success),
    error: (message) => toast.error(message, toastStyles.error),
};
