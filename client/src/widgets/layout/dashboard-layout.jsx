import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';

export const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar (Fixed Left) */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="md:pl-64 flex flex-col min-h-screen">
                {/* Header (Fixed Top) */}
                <Header />

                {/* Dynamic Page Content */}
                <main className="flex-1 pt-20 px-6 pb-8 animate-in fade-in duration-500">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};