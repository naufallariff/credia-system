import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    // Simple logic to determine page title based on path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Overview';
        if (path.includes('/contracts')) return 'Contract Management';
        if (path.includes('/clients')) return 'Client Directory';
        if (path.includes('/approvals')) return 'Approval Center';
        if (path.includes('/users')) return 'User Access';
        return 'Dashboard';
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-40">

            {/* Page Title */}
            <h2 className="text-lg font-bold text-slate-800">{getPageTitle()}</h2>

            {/* Right Actions */}
            <div className="flex items-center gap-4">

                {/* Search Bar (Visual Only for now) */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none w-64 transition-all"
                    />
                </div>

                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                {/* Notification Bell */}
                <button className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">
                    <Bell size={20} />
                    {/* Notification Badge */}
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;