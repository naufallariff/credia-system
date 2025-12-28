import { useState } from 'react';
import api from '../../../services/api';
import { X, Send } from 'lucide-react';

const ActionModal = ({ isOpen, onClose, contractId, actionType, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Maps UI Action to Backend Enum
            // 'ACTIVATE' -> request_type: 'ACTIVATE'
            // 'UPDATE' -> request_type: 'UPDATE'

            const payload = {
                target_model: 'CONTRACT',
                target_id: contractId,
                request_type: actionType, // 'ACTIVATE' or 'UPDATE'
                reason: reason,
                proposed_data: actionType === 'UPDATE' ? { note: 'General correction requested' } : {}
            };

            await api.post('/tickets', payload);
            onSuccess();
            onClose();
            alert('Request sent to Admin successfully.');
        } catch (error) {
            alert(`Request failed: ${error.response?.data?.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const titles = {
        ACTIVATE: 'Request Contract Activation',
        UPDATE: 'Request Data Correction',
        VOID: 'Request Contract Void/Cancellation'
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">{titles[actionType]}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Reason for Request <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="Please explain why this action is needed..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Sending...' : <><Send size={16} /> Send Request</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActionModal;