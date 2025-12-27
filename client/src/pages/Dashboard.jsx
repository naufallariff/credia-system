import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Import Axios kita
import { Button } from '../components/ui/Button';
import { ContractTable } from '../components/ui/ContractTable'; // Import Tabel
import { LogOut, RefreshCcw } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();

    // State User
    const [user] = useState(() => {
        const stored = sessionStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    // State Data Kontrak
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fungsi Fetch Data ke Backend
    const fetchContracts = async () => {
        setLoading(true);
        try {
            // Pastikan route backendmu '/api/contracts' (sesuaikan dengan route backend)
            const response = await api.get('/contracts');
            setContracts(response.data.data); // Asumsi struktur response: { status: true, data: [...] }
        } catch (error) {
            console.error("Gagal ambil data:", error);
            alert("Gagal memuat data kontrak.");
        } finally {
            setLoading(false);
        }
    };

    // Effect: Jalan sekali saat halaman dibuka
    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchContracts();
        }
    }, [user, navigate]);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/login');
    };

    const handleViewDetail = (id) => {
        // Nanti kita buat halaman detail
        alert(`Membuka detail kontrak: ${id}`);
        // navigate(/contracts/${id});
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar Sederhana */}
            <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold text-primary">IMS Finance Dashboard</h1>
                    <p className="text-xs text-slate-500">Welcome, {user.username} ({user.role})</p>
                </div>
                <Button
                    variant="outline"
                    className="w-auto px-4 py-2 text-xs"
                    onClick={handleLogout}
                >
                    <LogOut size={16} className="mr-2" /> Logout
                </Button>
            </nav>

            {/* Konten Utama */}
            <main className="max-w-7xl mx-auto p-8">

                {/* Header Section */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Daftar Kontrak Aktif</h2>
                        <p className="text-slate-500 mt-1">Pantau status pembayaran dan keterlambatan nasabah.</p>
                    </div>
                    <Button
                        className="w-auto bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                        onClick={fetchContracts}
                        isLoading={loading}
                    >
                        <RefreshCcw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
                    </Button>
                </div>

                {/* Tabel Data */}
                <div className="bg-white rounded-xl shadow-sm p-1 min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-slate-400">
                            <span className="animate-pulse">Sedang mengambil data dari server...</span>
                        </div>
                    ) : (
                        <ContractTable data={contracts} onViewDetail={handleViewDetail} />
                    )}
                </div>

            </main>
        </div>
    );
};

export default Dashboard;