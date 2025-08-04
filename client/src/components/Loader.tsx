import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
    <span className="ml-2 text-indigo-600 font-medium">Loading...</span>
  </div>
);

export default Loader;
