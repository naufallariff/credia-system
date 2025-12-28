import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary', // primary, outline, danger, ghost
    size = 'md',         // sm, md, lg
    isLoading = false,
    className = '',
    disabled,
    ...props
}) => {

    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
        primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 focus:ring-primary-500",
        outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 focus:ring-red-500",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;