import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from '@/app/routes/app-router';
import { AppQueryProvider } from '@/app/providers/query-provider'; // Import Provider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppQueryProvider>
            <AppRouter />
        </AppQueryProvider>
    </React.StrictMode>,
);