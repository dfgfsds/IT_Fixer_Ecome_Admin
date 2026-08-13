import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Search({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: SearchProps) {
  return (
    <div className={`relative min-w-[240px] ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <SearchIcon className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-xl border border-gray-300/80 bg-white py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#e2ba2b] focus:outline-none focus:ring-2 focus:ring-[#e2ba2b]/20 shadow-2xs transition-all"
        placeholder={placeholder}
      />
    </div>
  );
}