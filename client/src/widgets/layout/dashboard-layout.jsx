import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';

export const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-muted/40 transition-colors duration-300">
            {/* Sidebar (Fixed Left) */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="md:pl-64 flex flex-col min-h-screen transition-all duration-300">
                {/* Header (Fixed Top) */}
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* --- UI OPTIMIZATION HERE --- 
                    1. pt-24 : Memberikan margin atas yang besar (96px) agar tidak ketiban Header.
                    2. pb-10 : Memberikan margin bawah agar tidak mepet footer browser.
                    3. px-4 md:px-8 : Padding kiri kanan yang lebih lega.
                */}
                <main className="flex-1 pt-24 pb-10 px-4 md:px-8 animate-in fade-in duration-500">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};