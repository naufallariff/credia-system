import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Placeholder sementara sampai kita masuk Tahap 2
const App = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold text-primary">Credia Enterprise V3</h1>
            <p className="text-slate-500">System Re-Architecture in Progress...</p>
            <div className="inline-block px-4 py-2 bg-slate-100 rounded-lg font-mono text-sm">
                FSD Structure Ready
            </div>
        </div>
    </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);