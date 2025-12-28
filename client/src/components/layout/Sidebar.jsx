import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    Briefcase,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();

    // Define Role-Based Menus
    const MENUS = {
        SUPERADMIN: [
            { label: 'Dashboard', path: '/', icon: LayoutDashboard },
            { label: 'Approvals', path: '/approvals', icon: FileText },
            { label: 'User Mgmt', path: '/users', icon: Users },
            { label: 'Global Config', path: '/config', icon: Settings },
        ],
        ADMIN: [
            { label: 'Dashboard', path: '/', icon: LayoutDashboard },
            { label: 'Approvals', path: '/approvals', icon: FileText },
            { label: 'User Mgmt', path: '/users', icon: Users },
            { label: 'Config', path: '/config', icon: Settings },
        ],
        STAFF: [
            { label: 'Dashboard', path: '/', icon: LayoutDashboard },
            { label: 'My Contracts', path: '/contracts', icon: Briefcase },
            { label: 'Clients', path: '/clients', icon: Users },
        ],
        CLIENT: [
            { label: 'Dashboard', path: '/', icon: LayoutDashboard },
            { label: 'My Loans', path: '/my-loans', icon: Briefcase },
        ],
    };

    const currentMenus = MENUS[user?.role] || [];

    return (
        <div className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300 fixed left-0 top-0 z-50">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="font-bold text-white text-lg">C</span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Credia</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {currentMenus.map((menu) => (
                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        className={({ isActive }) => `
              flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
              ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                : 'hover:bg-slate-800 hover:text-white'}
            `}
                    >
                        <menu.icon size={20} className="mr-3 opacity-80 group-hover:opacity-100" />
                        <span className="font-medium text-sm">{menu.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-slate-400 text-xs font-bold uppercase rounded transition-colors"
                >
                    <LogOut size={14} className="mr-2" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;