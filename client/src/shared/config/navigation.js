import {
    LayoutDashboard,
    FileText,
    CheckSquare,
    Users,
    Settings,
    CreditCard,
    PieChart
} from 'lucide-react';

/**
 * RBAC Navigation Configuration
 * Defines strict visibility rules for the sidebar.
 */
export const NAV_ITEMS = [
    // 1. Dashboard (All Authenticated Users)
    {
        title: 'Overview',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: ['SUPERADMIN', 'ADMIN', 'STAFF', 'CLIENT']
    },

    // 2. Client Area (Client Only)
    {
        title: 'My Portfolio',
        path: '/client/dashboard',
        icon: CreditCard,
        roles: ['CLIENT']
    },

    // 3. Operational Module (Staff & Above)
    // Note: Clients cannot see the general contract directory.
    {
        title: 'Contract Management',
        path: '/contracts',
        icon: FileText,
        roles: ['SUPERADMIN', 'ADMIN', 'STAFF']
    },

    // 4. Risk & Compliance Module (Admin Only)
    // CRITICAL: Staff (Makers) must not see Approvals. SoD Principle.
    {
        title: 'Approvals',
        path: '/approvals',
        icon: CheckSquare,
        roles: ['SUPERADMIN', 'ADMIN']
    },

    // 5. Administration Module (Admin & Superadmin)
    {
        title: 'User Management',
        path: '/users',
        icon: Users,
        roles: ['SUPERADMIN', 'ADMIN']
    },

    // 6. System Core (Superadmin Only)
    // CRITICAL: Only Superadmin can change business rules (Interest rates, etc).
    {
        title: 'System Config',
        path: '/config',
        icon: Settings,
        roles: ['SUPERADMIN']
    }
];