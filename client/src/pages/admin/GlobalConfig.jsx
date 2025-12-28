import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, RefreshCw } from 'lucide-react';

const GlobalConfig = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/config');
            // If array, take the first one (Singleton pattern)
            const data = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
            setConfig(data);
        } catch (error) {
            console.error('Config load failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/config', {
                min_dp_percent: Number(config.min_dp_percent),
                // Send interest tiers as they are (assuming user edits them correctly or we build a complex UI)
                interest_tiers: config.interest_tiers
            });
            alert('System configuration updated successfully.');
        } catch (error) {
            alert('Update failed.', error);
        } finally {
            setSaving(false);
        }
    };

    const handleTierChange = (index, field, value) => {
        const newTiers = [...config.interest_tiers];
        newTiers[index][field] = Number(value);
        setConfig({ ...config, interest_tiers: newTiers });
    };

    if (loading) return <div className="p-8 text-slate-500">Loading configuration...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Global Configuration</h1>
                    <p className="text-slate-500 text-sm">Adjust loan logic parameters.</p>
                </div>
                <button onClick={fetchConfig} className="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50">
                    <RefreshCw size={20} />
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <Settings size={18} className="text-slate-500" />
                    <h3 className="font-bold text-slate-700">Loan Rules</h3>
                </div>

                <form onSubmit={handleUpdate} className="p-6 space-y-6">
                    {/* Min DP */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Minimum Down Payment (Decimal)
                        </label>
                        <p className="text-xs text-slate-500 mb-2">E.g., 0.2 means 20% of OTR Price.</p>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                            value={config.min_dp_percent}
                            onChange={(e) => setConfig({ ...config, min_dp_percent: e.target.value })}
                        />
                    </div>

                    {/* Interest Tiers */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            Interest Rate Tiers
                        </label>
                        <div className="space-y-3">
                            {config.interest_tiers.map((tier, index) => (
                                <div key={index} className="flex gap-4 items-end p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-400">Min Price</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-sm"
                                            value={tier.min_price}
                                            onChange={(e) => handleTierChange(index, 'min_price', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-400">Max Price</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-sm"
                                            value={tier.max_price}
                                            onChange={(e) => handleTierChange(index, 'max_price', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-xs text-slate-400">Rate (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-sm font-bold text-indigo-600"
                                            value={tier.rate_percent}
                                            onChange={(e) => handleTierChange(index, 'rate_percent', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center gap-2 ml-auto"
                        >
                            {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GlobalConfig;