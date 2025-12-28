import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <Navbar />

            <main className="ml-64 pt-16 p-8">
                <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;