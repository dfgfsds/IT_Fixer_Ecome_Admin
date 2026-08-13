import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export default function Button({
  children,
  loading,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] inline-flex items-center justify-center';

  const variants = {
    primary: 'bg-gradient-to-r from-[#e2ba2b] to-[#d4a81e] hover:from-[#d4a81e] hover:to-[#c49e1e] text-white shadow-md shadow-[#e2ba2b]/25 focus:ring-[#e2ba2b]',
    secondary: 'bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-900 shadow-sm',
    outline: 'border border-gray-300/80 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-300 shadow-2xs',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md shadow-red-600/20',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed active:scale-100' : ''
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}