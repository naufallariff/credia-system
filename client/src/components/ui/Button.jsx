import React from 'react';

export const Button = ({
    children,
    isLoading,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const baseStyles = "w-full font-medium py-2.5 px-4 rounded-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center";

    const variants = {
        primary: "bg-primary hover:bg-primary-hover text-white",
        danger: "bg-danger hover:bg-red-600 text-white",
        outline: "border border-slate-300 text-slate-700 hover:bg-slate-50"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-current" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : null}
            {children}
        </button>
    );
};