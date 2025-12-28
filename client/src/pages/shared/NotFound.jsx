import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-lg w-full border border-slate-100">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-amber-500" size={40} />
                </div>

                <h1 className="text-6xl font-black text-slate-900 mb-2">404</h1>
                <h2 className="text-2xl font-bold text-slate-700 mb-4">Page Not Found</h2>

                <p className="text-slate-500 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 gap-2"
                >
                    <Home size={20} />
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default NotFound;