import { LogOut, User, Menu } from 'lucide-react'; // Tambah Menu icon untuk persiapan mobile
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/shared/model/use-session';
import { NotificationBell } from '@/widgets/layout/notification-bell';
import { ModeToggle } from './mode-toggle';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";

export const Header = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const { clearSession, user } = useSession();

    const handleLogout = () => {
        clearSession();
        navigate('/auth/login');
    };

    return (
        <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border fixed top-0 right-0 left-0 md:left-64 z-20 px-6 flex items-center justify-between transition-colors duration-300">

            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center gap-4">
                {/* Tombol Menu Mobile (Hanya muncul di layar kecil) */}
                <Button variant="ghost" size="icon" className="md:hidden text-foreground" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                </Button>

                <h2 className="text-lg font-semibold text-foreground tracking-tight">Workspace</h2>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <ModeToggle />
                <NotificationBell />

                <div className="h-6 w-px bg-border mx-2"></div>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-muted border border-border p-0 hover:bg-accent">
                            <User size={18} className="text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-foreground">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};