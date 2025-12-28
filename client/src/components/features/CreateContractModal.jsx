import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Calculator, User } from 'lucide-react';

const CreateContractModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
    contractNo: `AGR${new Date().getFullYear()}${Math.floor(Math.random() * 10000)}`,
    clientId: '',
    otr: '',
    dpAmount: '',
    durationMonths: 12,
    startDate: new Date().toISOString().split('T')[0]
    });

    // Calculation State (Optimistic UI)
    const [summary, setSummary] = useState({
    principal: 0,
    monthly: 0,
    rate: 0
    });

    // 1. Fetch Clients on Mount
    useEffect(() => {
    if (isOpen) {
        const fetchClients = async () => {
        try {
            const res = await api.get('/users');
            // Filter only clients
            const clientList = res.data.data.filter(u => u.role === 'CLIENT');
            setClients(clientList);
        } catch (error) {
            console.error("Failed to fetch clients :", error);
        }
        };
        fetchClients();
    }
    }, [isOpen]);

    // 2. Real-time Financial Calculator
    useEffect(() => {
    const otr = parseFloat(formData.otr) || 0;
    const dp = parseFloat(formData.dpAmount) || 0;
    const duration = parseInt(formData.durationMonths) || 12;

    if (otr > 0) {
        // Logic mirrors the Backend Seeder Logic
        const rate = otr > 50000000 ? 0.08 : 0.15; // 8% for Cars, 15% for Bikes
        const principal = otr - dp;
        
        // Flat Rate Calculation
        const totalInterest = Math.ceil(principal * rate * (duration / 12));
        const totalLoan = principal + totalInterest;
        const monthlyRaw = totalLoan / duration;
        
        // Round up to nearest 1000
        const monthly = Math.ceil(monthlyRaw / 1000) * 1000;

        setSummary({
        principal: principal > 0 ? principal : 0,
        monthly: monthly,
        rate: rate * 100
        });
    }
    }, [formData.otr, formData.dpAmount, formData.durationMonths]);

    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await api.post('/contracts', {
        ...formData,
        otr: parseFloat(formData.otr),
        dpAmount: parseFloat(formData.dpAmount),
        durationMonths: parseInt(formData.durationMonths)
        });
        onSuccess();
        onClose();
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to create contract');
    } finally {
        setLoading(false);
    }
    };

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Financing Contract">
        <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Client Selection */}
        <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ml-1">
            Select Client
            </label>
            <div className="relative">
            <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-credia-100 focus:border-credia-500 outline-none appearance-none"
            >
                <option value="">-- Choose Client --</option>
                {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.username})</option>
                ))}
            </select>
            <User className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
            </div>
        </div>

        {/* Contract No & Date */}
        <div className="grid grid-cols-2 gap-4">
            <Input label="Contract No" name="contractNo" value={formData.contractNo} onChange={handleChange} required />
            <Input label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
        </div>

        {/* Financials */}
        <Input label="OTR Price (Rp)" name="otr" type="number" value={formData.otr} onChange={handleChange} placeholder="e.g. 30000000" required />
        
        <div className="grid grid-cols-2 gap-4">
            <Input label="Down Payment (Rp)" name="dpAmount" type="number" value={formData.dpAmount} onChange={handleChange} required />
            <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ml-1">Duration</label>
            <select 
                name="durationMonths" 
                value={formData.durationMonths} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-credia-100 outline-none"
            >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
            </select>
            </div>
        </div>

        {/* Live Calculation Summary (Optimistic UI) */}
        <div className="bg-credia-50 rounded-lg p-4 border border-credia-100 mt-4">
            <div className="flex items-center gap-2 mb-3">
            <Calculator size={16} className="text-credia-600" />
            <span className="text-xs font-bold text-credia-700 uppercase">Simulation</span>
            </div>
            <div className="space-y-1 text-sm">
            <div className="flex justify-between">
                <span className="text-slate-500">Interest Rate:</span>
                <span className="font-medium text-slate-700">{summary.rate}% Flat/Year</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-500">Principal:</span>
                <span className="font-medium text-slate-700">{formatRupiah(summary.principal)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-credia-200 mt-2">
                <span className="font-bold text-credia-800">Monthly Installment:</span>
                <span className="font-bold text-credia-600">{formatRupiah(summary.monthly)}</span>
            </div>
            </div>
        </div>

        <div className="pt-4 flex gap-3">
            <Button variant="secondary" onClick={onClose} className="w-full">Cancel</Button>
            <Button type="submit" isLoading={loading} className="w-full">Create Contract</Button>
        </div>
        </form>
    </Modal>
    );
};

export default CreateContractModal;