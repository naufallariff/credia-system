/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            // 1. Professional Color Palette (Blue & White)
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#3b82f6', // Standard Blue
                    600: '#2563eb', // Royal Blue (Main)
                    700: '#1d4ed8', // Darker Blue (Hover)
                    900: '#1e3a8a', // Navy (Sidebar/Text)
                },
                surface: {
                    50: '#f8fafc', // Very light grey/white for backgrounds
                    100: '#f1f5f9',
                    900: '#0f172a', // Text color
                }
            },
            // 2. Font Family (Clean & Modern)
            fontFamily: {
                sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
            },
            // 3. Dynamic Motion (Keyframes)
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
                'scale-in': 'scaleIn 0.2s ease-out forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                }
            }
        },
    },
    plugins: [],
}