import { useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, LogOut, PieChart, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    // 1. Safe User Retrieval (Prevent Crash if storage is empty)
    const user = JSON.parse(sessionStorage.getItem('user') || '{"role": "GUEST"}');

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        window.location.href = '/login'; // Hard reload for security
    };

    // 2. Menu Configuration with RBAC (Role Based Access Control)
    const menuItems = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            path: '/',
            roles: ['ADMIN', 'STAFF', 'CLIENT']
        },
        {
            icon: FileText,
            label: 'Contracts',
            path: '/contracts',
            roles: ['ADMIN', 'STAFF'] // Client cannot see full list
        },
        {
            icon: Users,
            label: 'Client Data',
            path: '/clients',
            roles: ['ADMIN', 'STAFF']
        },
        {
            icon: PieChart,
            label: 'Reports',
            path: '/reports',
            roles: ['ADMIN'] // Only Admin
        },
        {
            icon: ShieldAlert,
            label: 'System Config',
            path: '/config',
            roles: ['ADMIN']
        },
    ];

    // 3. Filter Menu based on User Role
    const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

    return (
        <aside className="w-72 bg-credia-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-credia-800 z-50 transition-all duration-300">

            {/* Brand Header */}
            <div className="h-20 flex items-center px-8 border-b border-credia-800 bg-credia-950/50 backdrop-blur-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-credia-500 to-credia-700 rounded-xl flex items-center justify-center mr-3 shadow-glow">
                    <span className="text-white font-bold text-xl">C</span>
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg tracking-tight leading-tight">Credia</h1>
                    <p className="text-xs text-credia-400 font-medium tracking-wide">ENTERPRISE SYSTEM</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                <div className="px-4 mb-4 text-[10px] font-bold text-credia-500 uppercase tracking-widest opacity-80">
                    Main Modules
                </div>

                {filteredMenu.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${isActive
                                    ? 'bg-credia-600/10 text-white shadow-inner'
                                    : 'hover:bg-credia-800/30 hover:text-white'
                                }`}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-credia-500 rounded-r-full shadow-glow"></div>
                            )}

                            <item.icon
                                size={20}
                                className={`mr-3 transition-colors duration-300 ${isActive ? 'text-credia-400' : 'text-slate-500 group-hover:text-credia-300'
                                    }`}
                            />
                            <span className="font-medium text-sm tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Profile */}
            <div className="p-6 border-t border-credia-800 bg-credia-950/30">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-credia-800 border-2 border-credia-600 flex items-center justify-center text-white font-bold text-sm">
                        {user.username?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-credia-400 truncate">{user.email}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full px-4 py-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all duration-200 border border-red-500/20"
                >
                    <LogOut size={16} className="mr-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;