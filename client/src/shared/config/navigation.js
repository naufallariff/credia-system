import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    FilePlus,
    CheckSquare,
    CreditCard
} from 'lucide-react';

export const NAV_ITEMS = [
    {
        title: "Overview",
        path: "/dashboard",
        icon: LayoutDashboard,
        roles: ['ADMIN', 'STAFF', 'SUPERADMIN', 'CLIENT'],
    },
    {
        title: "Contract Management",
        path: "/contracts",
        icon: FileText,
        roles: ['ADMIN', 'STAFF', 'SUPERADMIN'],
    },
    {
        title: "New Application",
        path: "/contracts/new",
        icon: FilePlus,
        roles: ['STAFF', 'ADMIN', 'SUPERADMIN'],
    },
    {
        title: "Approvals",
        path: "/approvals",
        icon: CheckSquare,
        roles: ['ADMIN', 'SUPERADMIN'],
    },
    {
        title: "User Management",
        path: "/users",
        icon: Users,
        roles: ['ADMIN', 'SUPERADMIN'],
    },
    {
        title: "My Loans",
        path: "/client/loans",
        icon: CreditCard,
        roles: ['CLIENT'],
    },
    {
        title: "System Config",
        path: "/config",
        icon: Settings,
        roles: ['ADMIN', 'SUPERADMIN'],
    },
];