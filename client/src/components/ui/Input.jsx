import React from 'react';

export const Input = ({ label, error, type = "text", ...props }) => {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${error
                        ? "border-danger focus:ring-danger/20"
                        : "border-slate-300 focus:border-primary focus:ring-primary/20"
                    }`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
        </div>
    );
};