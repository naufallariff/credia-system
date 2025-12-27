/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'], // Professional font stack
            },
            colors: {
                // Credia Brand Palette (Modern Fintech Blue)
                credia: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6', // Standard Blue
                    600: '#2563eb', // Primary Action
                    700: '#1d4ed8',
                    800: '#1e40af', // Deep Blue
                    900: '#0f172a', // Sidebar Background (Very Dark Blue)
                    950: '#020617',
                }
            },
            boxShadow: {
                'glow': '0 0 15px rgba(37, 99, 235, 0.3)', // Blue glow effect
            }
        },
    },
    plugins: [],
}