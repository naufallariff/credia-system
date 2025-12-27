import Sidebar from './ui/Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar fixed width is w-72 (18rem) */}
            <Sidebar />

            {/* Main Content Area */}
            {/* Added ml-72 to match Sidebar width */}
            <main className="flex-1 ml-72 p-10 overflow-y-auto h-screen relative">
                {/* Background Decoration (Subtle) */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-credia-50 to-transparent -z-10" />

                {children}
            </main>
        </div>
    );
};

export default Layout;