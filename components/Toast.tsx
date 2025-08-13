import React, { useEffect } from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

const SuccessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 001 1h.01a1 1 0 100-2H10a1 1 0 00-1 1z" clipRule="evenodd" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const TOAST_CONFIG = {
    success: {
        bg: 'bg-green-800/90',
        border: 'border-green-600',
        textColor: 'text-green-200',
        title: 'Thành công',
        icon: <SuccessIcon />,
    },
    error: {
        bg: 'bg-red-800/90',
        border: 'border-red-600',
        textColor: 'text-red-200',
        title: 'Đã xảy ra lỗi',
        icon: <ErrorIcon />,
    },
    info: {
        bg: 'bg-blue-800/90',
        border: 'border-blue-600',
        textColor: 'text-blue-200',
        title: 'Thông báo',
        icon: <InfoIcon />,
    }
};


export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 7000); // Auto-dismiss after 7 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const config = TOAST_CONFIG[toast.type];

  return (
    <div className="fixed top-4 right-4 z-[100] w-full max-w-sm animate-fade-in-right">
      <div className={`${config.bg} border ${config.border} text-white p-4 rounded-lg shadow-2xl backdrop-blur-sm flex items-start gap-4`}>
        <div className="flex-shrink-0 pt-0.5">
            {config.icon}
        </div>
        <div className="flex-grow">
            <h4 className="font-bold">{config.title}</h4>
            <p className={`text-sm ${config.textColor} mt-1`}>{toast.message}</p>
        </div>
        <button onClick={onClose} className={`flex-shrink-0 ${config.textColor} hover:text-white transition-colors`} aria-label="Đóng thông báo">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <style>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-right {
          animation: fadeInRight 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};