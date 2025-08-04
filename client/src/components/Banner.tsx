import React from 'react';

interface BannerProps {
  type?: 'info' | 'success' | 'error';
  message: string;
  onClose?: () => void;
}

const typeStyles = {
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
};

const Banner: React.FC<BannerProps> = ({ type = 'info', message, onClose }) => (
  <div className={`flex items-center justify-between px-4 py-2 rounded ${typeStyles[type]} mb-4`} role="alert">
    <span>{message}</span>
    {onClose && (
      <button onClick={onClose} className="ml-2 text-lg font-bold focus:outline-none">×</button>
    )}
  </div>
);

export default Banner;
