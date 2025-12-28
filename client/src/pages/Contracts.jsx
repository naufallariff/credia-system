import { useEffect, useState } from 'react';
import api from '../services/api';
import ContractTable from '../components/ui/ContractTable';
import Button from '../components/ui/Button';
import CreateContractModal from '../components/features/CreateContractModal';
import PaymentModal from '../components/features/PaymentModal'; // Import
import { Plus, Search, Filter } from 'lucide-react';

const Contracts = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState({ isOpen: false, contractId: null });

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const canCreate = ['ADMIN', 'STAFF'].includes(user.role);

    const fetchContracts = async () => {
    setLoading(true);
    try {
        const res = await api.get('/contracts');
        setContracts(res.data.data.contracts);
    } catch (error) {
        console.error("Failed to load contracts", error);
    } finally {
        setLoading(false);
    }
    };

    useEffect(() => {
    fetchContracts();
    }, []);

    const filteredContracts = contracts.filter(c => 
    c.contract_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client_name_snapshot.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handler for Payment Click
    const handlePayClick = (contractId) => {
    setPaymentModalData({ isOpen: true, contractId });
    };

    return (
    <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Contract Management</h2>
            <p className="text-slate-500 text-sm mt-1">Manage lifecycle and payments.</p>
        </div>
        
        {canCreate && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            New Contract
            </Button>
        )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
            type="text" 
            placeholder="Search by Contract No or Client Name..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-credia-100 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="w-px h-8 bg-slate-200 mx-2"></div>
        <button className="flex items-center text-slate-600 hover:text-credia-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter size={18} className="mr-2" />
            Filter Status
        </button>
        </div>

        {/* Data Table with Payment Handler */}
        <ContractTable 
        contracts={filteredContracts} 
        isLoading={loading} 
        onPayClick={handlePayClick}
        />

        {/* Modals */}
        <CreateContractModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchContracts} 
        />

        <PaymentModal 
        isOpen={paymentModalData.isOpen}
        contractId={paymentModalData.contractId}
        onClose={() => setPaymentModalData({ isOpen: false, contractId: null })}
        onSuccess={fetchContracts}
        />
    </div>
    );
};

export default Contracts;