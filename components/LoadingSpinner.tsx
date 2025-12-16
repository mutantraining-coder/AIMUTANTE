import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-[1px] border-neutral-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-t-[1px] border-white rounded-full animate-spin"></div>
      </div>
      <p className="text-white text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Processando...</p>
    </div>
  );
};

export default LoadingSpinner;