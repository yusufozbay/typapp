import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 mb-6 ${className}`}>
    {children}
  </div>
);

export default Card;
