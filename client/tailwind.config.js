/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: { DEFAULT: "#0f172a", hover: "#1e293b" },
                accent: { DEFAULT: "#0ea5e9", hover: "#0284c7" },
                success: "#10b981",
                warning: "#f59e0b",
                danger: "#ef4444",
                background: "#f8fafc",
            }
        },
    },
    plugins: [],
}