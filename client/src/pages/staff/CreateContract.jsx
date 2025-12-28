import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatRupiah } from '../../utils/formatters';
import { Calculator, Save, User } from 'lucide-react';

const CreateContract = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        client_id: '',
        otr_price: '',
        dp_amount: '',
        interest_rate: 15, // Default 15%
        duration_month: 12
    });

    // Fetch Clients for Dropdown
    useEffect(() => {
        const fetchClients = async () => {
            try {
                // In a real scenario, this should be a search endpoint to avoid loading massive data
                const res = await api.get('/users?role=CLIENT&status=ACTIVE');
                setClients(res.data.data);
            } catch (error) {
                console.error('Failed to load clients', error);
            }
        };
        fetchClients();
    }, []);

    // Live Estimation Logic
    const estimation = useMemo(() => {
        const otr = parseFloat(formData.otr_price) || 0;
        const dp = parseFloat(formData.dp_amount) || 0;
        const rate = parseFloat(formData.interest_rate) || 0;
        const months = parseInt(formData.duration_month) || 12;

        const principal = otr - dp;
        if (principal <= 0) return null;

        // Simple Flat Rate Calculation (Estimation only)
        const totalInterest = Math.ceil(principal * (rate / 100) * (months / 12));
        const totalLoan = principal + totalInterest;
        const monthly = Math.ceil(totalLoan / months);

        return { principal, totalLoan, monthly };
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.post('/contracts', {
                client_id: formData.client_id,
                otr_price: Number(formData.otr_price),
                dp_amount: Number(formData.dp_amount),
                interest_rate: Number(formData.interest_rate),
                duration_month: Number(formData.duration_month)
            });
            navigate('/contracts'); // Redirect to list
        } catch (error) {
            alert(`Submission failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">New Contract Submission</h1>
                <p className="text-slate-500">Create a new loan application for a client.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* FORM SECTION */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Client Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Client</label>
                            <div className="relative">
                                <User className="absolute top-3 left-3 text-slate-400" size={18} />
                                <select
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                                    value={formData.client_id}
                                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                >
                                    <option value="">-- Choose Client --</option>
                                    {clients.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} ({c.username})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">OTR Price (IDR)</label>
                                <input
                                    type="number"
                                    required
                                    min="1000000"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.otr_price}
                                    onChange={(e) => setFormData({ ...formData, otr_price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Down Payment (IDR)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.dp_amount}
                                    onChange={(e) => setFormData({ ...formData, dp_amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (% / Year)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.1"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.interest_rate}
                                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Months)</label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    value={formData.duration_month}
                                    onChange={(e) => setFormData({ ...formData, duration_month: e.target.value })}
                                >
                                    {[6, 12, 18, 24, 36, 48].map(m => (
                                        <option key={m} value={m}>{m} Months</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Submitting...' : <><Save size={20} /> Create Contract</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ESTIMATION CARD */}
                <div className="md:col-span-1">
                    <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6 sticky top-24">
                        <div className="flex items-center gap-2 mb-4 text-indigo-300">
                            <Calculator size={20} />
                            <h3 className="font-bold text-sm uppercase tracking-wide">Live Simulation</h3>
                        </div>

                        {estimation ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-slate-400 text-xs">Principal Amount</p>
                                    <p className="font-mono font-medium">{formatRupiah(estimation.principal)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">Total Loan + Interest</p>
                                    <p className="font-mono font-medium">{formatRupiah(estimation.totalLoan)}</p>
                                </div>
                                <div className="pt-4 border-t border-slate-700">
                                    <p className="text-slate-400 text-xs mb-1">Est. Monthly Installment</p>
                                    <p className="text-2xl font-bold text-green-400">{formatRupiah(estimation.monthly)}</p>
                                    <p className="text-xs text-slate-500 mt-1">/ month</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm italic">
                                Enter OTR Price and DP to see the simulation.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateContract;