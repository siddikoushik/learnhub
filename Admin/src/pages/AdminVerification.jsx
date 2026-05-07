import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    Eye, 
    Search, 
    Filter, 
    User, 
    CreditCard, 
    Calendar,
    ExternalLink,
    ChevronRight,
    Image as ImageIcon
} from 'lucide-react';

const AdminVerification = () => {
    const { token } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [filter, setFilter] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    const fetchPendingPayments = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/payment/pending-payments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPayments(res.data.payments);
            }
        } catch (error) {
            console.error("Failed to fetch pending payments", error);
            toast.error("Failed to fetch pending payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchPendingPayments();
    }, [token]);

    const handleVerify = async (paymentId, status) => {
        const confirmMsg = status === 'verified' ? 'Approve this payment?' : 'Reject this payment?';
        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await axios.post(`${API_URL}/api/payment/verify-payment`, 
            { paymentId, status },
            { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success(`Payment ${status} successfully!`);
                setPayments(payments.filter(p => p._id !== paymentId));
            }
        } catch (error) {
            console.error("Verification failed", error);
            toast.error("Verification failed");
        }
    };

    const filteredPayments = payments.filter(p => 
        p.paymentRef?.toLowerCase().includes(filter.toLowerCase()) ||
        p.studentId?.name?.toLowerCase().includes(filter.toLowerCase()) ||
        p.teacherId?.name?.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading pending verifications...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        Payment Verifications
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                            {payments.length} Pending
                        </span>
                    </h1>
                    <p className="text-slate-500 mt-1">Review and approve manual QR transactions</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Ref, Student or Teacher..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-6 py-3 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredPayments.length === 0 ? (
                    <div className="col-span-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">All Caught Up!</h3>
                        <p className="text-slate-500">No pending payments match your search or criteria.</p>
                    </div>
                ) : (
                    filteredPayments.map((payment) => (
                        <div key={payment._id} className="group bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            {/* Card Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white leading-tight">
                                            {payment.studentId?.name || 'Deleted Student'}
                                        </h3>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(payment.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border border-amber-200 dark:border-amber-500/20">
                                    Pending
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Amount</p>
                                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{payment.amount}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Ref ID</p>
                                        <p className="text-xs font-mono font-bold truncate" title={payment.paymentRef}>
                                            {payment.paymentRef}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 flex items-center gap-2"><CreditCard size={14} /> Teacher:</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{payment.teacherId?.name || 'Unknown'}</span>
                                    </div>
                                    {payment.transactionId && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 flex items-center gap-2"><FileText size={14} /> Trx ID:</span>
                                            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{payment.transactionId}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Proof Image Preview */}
                                <div 
                                    className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer group/img border border-slate-200 dark:border-slate-700"
                                    onClick={() => {
                                        const imgUrl = payment.screenshotUrl?.startsWith('/images') 
                                            ? `${API_URL}${payment.screenshotUrl}` 
                                            : `${API_URL}/images/${payment.screenshotUrl}`;
                                        setSelectedImage(imgUrl);
                                    }}
                                >
                                    {payment.screenshotUrl ? (
                                        <>
                                            <img 
                                                src={payment.screenshotUrl?.startsWith('/images') 
                                                    ? `${API_URL}${payment.screenshotUrl}` 
                                                    : `${API_URL}/images/${payment.screenshotUrl}`} 
                                                alt="Proof" 
                                                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                                                    <Eye size={20} />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <ImageIcon size={32} strokeWidth={1} />
                                            <span className="text-xs font-medium">No screenshot uploaded</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-6 pt-0 flex gap-3">
                                <button 
                                    onClick={() => handleVerify(payment._id, 'verified')}
                                    disabled={!payment.screenshotUrl}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl flex justify-center items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                >
                                    <CheckCircle size={16} /> Approve
                                </button>
                                <button 
                                    onClick={() => handleVerify(payment._id, 'rejected')}
                                    className="px-6 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 text-slate-400 py-4 rounded-2xl flex justify-center items-center transition-all active:scale-95"
                                    title="Reject Payment"
                                >
                                    <XCircle size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Lightbox / Fullscreen Image */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2">
                        <XCircle size={32} />
                    </button>
                    <div className="relative max-w-5xl w-full max-h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                        <img 
                            src={selectedImage} 
                            alt="Verification Fullscreen" 
                            className="w-full h-full object-contain bg-black/20"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
                            <div className="text-white">
                                <p className="text-xs text-white/60 font-bold uppercase tracking-widest">Verification Proof</p>
                                <p className="text-sm">Inspect carefully for Reference ID and Amount</p>
                            </div>
                            <a href={selectedImage} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors">
                                <ExternalLink size={14} /> Open Original
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerification;
