import { LogOut, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/shared/model/use-session';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";

export const Header = () => {
    const navigate = useNavigate();
    const { clearSession, user } = useSession();

    const handleLogout = () => {
        clearSession();
        navigate('/auth/login');
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 md:left-64 z-40 px-6 flex items-center justify-between">
            {/* Left: Page Title (Dynamic placeholder) */}
            <div>
                <h2 className="text-lg font-semibold text-slate-800">Workspace</h2>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Notification Bell (Placeholder for now) */}
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary hover:bg-primary/5">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </Button>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-slate-100 p-0 border border-slate-200">
                            <User size={18} className="text-slate-600" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};