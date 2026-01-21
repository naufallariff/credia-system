import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from '@/app/routes/app-router';
import { AppQueryProvider } from '@/app/providers/query-provider'; 
import ErrorBoundary from './app/providers/error-boundary.jsx';
import { ThemeProvider } from "@/app/providers/theme-provider";
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* Layer 1: Error Boundary (Menangkap crash) */}
        <ErrorBoundary>
            <ThemeProvider defaultTheme="light" storageKey="credia-theme">
                {/* Layer 2: React Query Provider (Data Fetching) */}
                <AppQueryProvider>
                    {/* Layer 3: Router (Navigasi) */}
                    <AppRouter />
                </AppQueryProvider>
            </ThemeProvider>
        </ErrorBoundary>
    </React.StrictMode>,
);