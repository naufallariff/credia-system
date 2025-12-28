import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Check, X, FileText, AlertCircle, Clock } from 'lucide-react';

const ApprovalList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchTickets = useCallback(async () => {
        try {
            // Fetch only PENDING tickets
            const res = await api.get('/tickets?status=PENDING');
            setTickets(res.data.data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleDecision = async (id, decision) => {
        if (!window.confirm(`Are you sure you want to ${decision} this request?`)) return;

        setProcessingId(id);
        try {
            const endpoint = decision === 'APPROVE'
                ? `/tickets/${id}/approve`
                : `/tickets/${id}/reject`;

            await api.post(endpoint, { admin_note: `Manual ${decision} via Dashboard` });

            // Remove the processed ticket from the list UI instantly
            setTickets((prev) => prev.filter((t) => t._id !== id));

        } catch (error) {
            alert(`Action failed: ${error.response?.data?.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="p-4 text-slate-500">Loading tickets...</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Pending Approvals</h1>
                <p className="text-slate-500">Review and authorize sensitive operations.</p>
            </div>

            {tickets.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">All Caught Up</h3>
                    <p className="text-slate-500">There are no pending requests at this time.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket._id}
                            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6"
                        >
                            {/* Icon Status */}
                            <div className="shrink-0">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <Clock className="text-amber-600" size={24} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                                        {ticket.request_type}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        Ticket #{ticket.ticket_no}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    Request to {ticket.request_type} on {ticket.target_model}
                                </h3>

                                <p className="text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                                    <span className="font-semibold">Reason:</span> {ticket.reason}
                                </p>

                                {/* Audit Info */}
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <FileText size={14} />
                                        <span>Req by: {ticket.requester?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 shrink-0 border-l border-slate-100 pl-0 md:pl-6">
                                <button
                                    onClick={() => handleDecision(ticket._id, 'REJECT')}
                                    disabled={processingId === ticket._id}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleDecision(ticket._id, 'APPROVE')}
                                    disabled={processingId === ticket._id}
                                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {processingId === ticket._id ? 'Processing...' : (
                                        <>
                                            <Check size={18} /> Approve
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApprovalList;