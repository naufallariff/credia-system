import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    isLoading = false,
    className = '',
    disabled,
    type = 'button',
    ...props
}) => {

    const baseStyles = "inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide";

    const variants = {
        primary: "bg-credia-600 hover:bg-credia-700 text-white focus:ring-credia-500 shadow-lg shadow-credia-600/20 border border-transparent",
        secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-200 shadow-sm",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg shadow-red-600/20",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-600 border border-transparent"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 size={16} className="animate-spin mr-2" />}
            {children}
        </button>
    );
};

export default Button;