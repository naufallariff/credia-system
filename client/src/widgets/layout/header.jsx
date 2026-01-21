import { LogOut, User, Menu, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/shared/model/use-session';
import { NotificationBell } from './notification-bell';
import { ModeToggle } from './mode-toggle';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator, // <-- 1. PERBAIKAN: Import ini ditambahkan
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

export const Header = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const { clearSession, user } = useSession();

    const handleLogout = () => {
        clearSession();
        navigate('/auth/login', { replace: true });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border fixed top-0 right-0 left-0 md:left-64 z-20 px-6 flex items-center justify-between transition-colors duration-300">

            {/* Left: Mobile Toggle & Title */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden text-foreground" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="hidden md:flex flex-col">
                    <span className="text-sm font-semibold text-foreground tracking-tight">Workspace</span>
                    <span className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <ModeToggle />
                <NotificationBell />

                <div className="h-6 w-px bg-border mx-1"></div>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="pl-2 pr-1 h-10 rounded-full hover:bg-accent flex items-center gap-2">
                            <Avatar className="h-8 w-8 border border-border">
                                <AvatarImage src="" alt={user?.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                    {getInitials(user?.name)}
                                </AvatarFallback>
                            </Avatar>

                            {/* 2. PERBAIKAN TAILWIND CONFLICT DI SINI */}
                            {/* Hapus 'flex' di awal. Gunakan 'hidden' (default sembunyi) lalu 'sm:flex' (tampil di desktop) */}
                            <div className="hidden sm:flex flex-col items-start text-left">
                                <span className="text-xs font-semibold text-foreground max-w-[100px] truncate">{user?.name}</span>
                                <span className="text-[10px] text-muted-foreground capitalize">{user?.role?.toLowerCase()}</span>
                            </div>

                            <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-foreground">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => navigate('/config')} className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};