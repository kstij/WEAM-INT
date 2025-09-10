import React from 'react';

const WeamLogo = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        className={`${sizeClasses[size]} text-blue-600`}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
        <path d="M2 17L12 22L22 17" />
        <path d="M2 12L12 17L22 12" />
      </svg>
      <span className="ml-2 text-xl font-bold text-gray-800">Weam AI</span>
    </div>
  );
};

export default WeamLogo;
