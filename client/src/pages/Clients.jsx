import { useEffect, useState } from 'react';
import api from '../services/api';
import Input from '../components/ui/Input';
import { Search, Users, Mail, Shield } from 'lucide-react';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
    const fetchClients = async () => {
        try {
        const res = await api.get('/users');
        // Filter only clients to maintain strict data separation
        const clientList = res.data.data.filter(u => u.role === 'CLIENT');
        setClients(clientList);
        } catch (error) {
        console.error("Failed to fetch client directory.", error);
        } finally {
        setLoading(false);
        }
    };
    fetchClients();
    }, []);

    const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Client Directory</h2>
            <p className="text-slate-500 text-sm mt-1">Registry of all registered borrowers.</p>
        </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
            type="text" 
            placeholder="Search by Name, Email or Username..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-credia-100 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Identity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Information</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">System Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 animate-pulse">Synchronizing directory...</td>
                </tr>
                ) : filteredClients.length === 0 ? (
                <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400">No clients found in registry.</td>
                </tr>
                ) : (
                filteredClients.map((client) => (
                    <tr key={client._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-credia-100 text-credia-600 flex items-center justify-center font-bold text-xs mr-3">
                            {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-slate-900">{client.name}</div>
                            <div className="text-xs text-slate-500">@{client.username}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center text-slate-600 text-sm">
                        <Mail size={14} className="mr-2" />
                        {client.email}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center text-slate-600 text-xs font-mono bg-slate-100 px-2 py-1 rounded w-fit">
                        <Shield size={12} className="mr-1" />
                        {client.role}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        VERIFIED
                        </span>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
        </div>
    </div>
    );
};

export default Clients;