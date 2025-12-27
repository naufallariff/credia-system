import React from 'react';

const Input = React.forwardRef(({ 
label, 
error, 
className = '', 
id,
...props 
}, ref) => {
const inputId = id || props.name;

return (
    <div className="w-full">
    {label && (
        <label 
        htmlFor={inputId} 
        className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ml-1"
        >
        {label}
        </label>
    )}
    <div className="relative">
        <input
        ref={ref}
        id={inputId}
        className={`
            w-full px-4 py-2.5 rounded-lg border bg-white text-slate-900 text-sm transition-all duration-200
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
            : 'border-slate-300 focus:border-credia-500 focus:ring-credia-100 hover:border-slate-400'
            }
            ${className}
        `}
        {...props}
        />
    </div>
    {error && (
        <p className="mt-1.5 ml-1 text-xs text-red-600 font-medium animate-in slide-in-from-top-1">
        {error}
        </p>
    )}
    </div>
);
});

Input.displayName = 'Input';

export default Input;