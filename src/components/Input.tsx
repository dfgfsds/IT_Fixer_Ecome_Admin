import React from 'react';

const Input = React.forwardRef(({ label, type = 'text', disabled, readOnly, error, required, className = '', ...props }: any, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
        className={`w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border rounded-xl shadow-2xs transition-all placeholder:text-gray-400 focus:outline-none ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-gray-300/80 focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20'
        } ${disabled ? 'bg-gray-100/70 text-gray-500 cursor-not-allowed' : ''} ${className}`}
      />
      {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
