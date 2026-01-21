import { NavLink } from 'react-router-dom';
import { useSession } from '@/shared/model/use-session';
import { NAV_ITEMS } from '@/shared/config/navigation';
import { cn } from '@/shared/lib/utils';

export const Sidebar = () => {
    const { user } = useSession();
    const userRole = user?.role;

    // Filter menu based on User Role (Logika Tetap)
    const filteredNav = NAV_ITEMS.filter((item) =>
        item.roles.includes(userRole)
    );

    return (
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30 bg-card border-r border-border h-screen">
            {/* 1. Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xl">C</span>
                    </div>
                    <span className="text-lg font-bold text-foreground tracking-tight">
                        Credia<span className="text-primary">Sys</span>
                    </span>
                </div>
            </div>

            {/* 2. Navigation Menu */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Main Menu
                </p>

                {filteredNav.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-sm" // Active State Solid
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground" // Inactive Hover
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    size={18}
                                    className={cn(
                                        "transition-colors",
                                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                                    )}
                                />
                                {item.title}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* 3. User Profile Snippet (Bottom) */}
            <div className="p-4 border-t border-border bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-border">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};