import { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CreditCard, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, contractId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [contract, setContract] = useState(null);
    const [bill, setBill] = useState(null);

    // Constants mirroring Backend Logic
    const PENALTY_RATE_PER_DAY = 0.005; // 0.5%

    useEffect(() => {
    if (isOpen && contractId) {
        fetchDetails();
    }
    }, [isOpen, contractId]);

    const fetchDetails = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/contracts/${contractId}`);
        const data = res.data.data;
        setContract(data);
        calculateBill(data);
    } catch (error) {
        console.error("Failed to load contract details", error);
    } finally {
        setLoading(false);
    }
    };

    const calculateBill = (contractData) => {
    // Find the first UNPAID or LATE month
    const nextBill = contractData.amortization.find(
        item => item.status === 'UNPAID' || item.status === 'LATE'
    );

    if (!nextBill) {
        setBill(null); // Fully Paid
        return;
    }

    // Penalty Calculation Logic
    const dueDate = new Date(nextBill.due_date);
    const today = new Date();
    let penalty = 0;
    let daysLate = 0;

    // Check if strictly past due date (ignoring time)
    const isLate = today.setHours(0,0,0,0) > dueDate.setHours(0,0,0,0);

    if (isLate) {
        const diffTime = Math.abs(today - dueDate);
        daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        penalty = Math.ceil(nextBill.amount * PENALTY_RATE_PER_DAY * daysLate);
    }

    setBill({
        ...nextBill,
        daysLate,
        penalty,
        total: nextBill.amount + penalty
    });
    };

    const handlePayment = async () => {
    if (!bill) return;
    setProcessing(true);
    try {
        await api.post(`/contracts/${contractId}/pay`, {
        month: bill.month,
        amount: bill.total // Must match backend expectation
        });
        onSuccess();
        onClose();
    } catch (error) {
        alert(error.response?.data?.message || 'Payment processing failed.');
    } finally {
        setProcessing(false);
    }
    };

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Installment">
        {loading ? (
        <div className="p-8 text-center text-slate-500 animate-pulse">Retrieving billing data...</div>
        ) : !bill ? (
        <div className="p-6 text-center">
            <div className="p-3 bg-green-100 text-green-600 rounded-full w-fit mx-auto mb-4">
            <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">All Paid Up!</h3>
            <p className="text-slate-500 text-sm mt-2">This contract has no pending installments.</p>
            <div className="mt-6">
            <Button onClick={onClose} variant="secondary">Close</Button>
            </div>
        </div>
        ) : (
        <div className="space-y-6">
            {/* Bill Header */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billing Period</span>
                <span className="text-sm font-semibold text-slate-900">Month {bill.month} of {contract.duration_month}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</span>
                <div className="flex items-center text-sm font-semibold text-slate-900">
                <Calendar size={14} className="mr-1.5 text-slate-400" />
                {formatDate(bill.due_date)}
                </div>
            </div>
            </div>

            {/* Late Warning */}
            {bill.daysLate > 0 && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-3">
                <AlertTriangle className="text-red-600 shrink-0" size={20} />
                <div>
                <h4 className="text-sm font-bold text-red-700">Payment Overdue</h4>
                <p className="text-xs text-red-600 mt-0.5">
                    Late by {bill.daysLate} days. A penalty of 0.5% per day has been applied.
                </p>
                </div>
            </div>
            )}

            {/* Payment Breakdown */}
            <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm">
                <span className="text-slate-600">Principal Installment</span>
                <span className="font-medium text-slate-900">{formatRupiah(bill.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-600">Late Penalty</span>
                <span className="font-medium text-red-600">+{formatRupiah(bill.penalty)}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-lg text-slate-800">Total</span>
                <span className="font-bold text-xl text-credia-600">{formatRupiah(bill.total)}</span>
            </div>
            </div>

            {/* Action */}
            <div className="pt-2">
            <Button 
                onClick={handlePayment} 
                isLoading={processing} 
                className="w-full py-3 text-base shadow-lg shadow-credia-600/20"
            >
                <CreditCard size={18} className="mr-2" />
                Confirm Payment
            </Button>
            </div>
        </div>
        )}
    </Modal>
    );
};

export default PaymentModal;