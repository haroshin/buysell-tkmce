import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`bg-dark-800 border ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-dark-700 focus:border-primary-500 focus:ring-primary-500/20'
        } text-dark-50 rounded-xl px-4 py-2.5 transition-all outline-none focus:ring-4 placeholder:text-dark-400 disabled:opacity-50 disabled:cursor-not-allowed`}
        {...props}
      />
      {error && (
        <span className="text-sm text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
