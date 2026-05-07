import React, { useState, useEffect } from 'react';
import {
    Search,
    Calendar,
    Clock,
    User,
    GraduationCap,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Filter,
    ArrowUpRight,
    BadgeIndianRupee
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/bookings', {
                params: {
                    status: statusFilter,
                    paymentStatus: paymentFilter,
                    search: search
                }
            });
            if (res.data.success) {
                setBookings(res.data.bookings);
            }
        } catch (error) {
            toast.error("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBookings();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter, paymentFilter]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'Cancelled': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            default: return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        }
    };

    const getPaymentStyle = (status) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'Under Review': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
            case 'Failed': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="p-6 space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b pb-6" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                    <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Session Registry</h1>
                    <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-wider">Monitor all tutor-student interactions</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                        Total Sessions: {bookings.length}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-[2rem] border shadow-sm transition-all duration-500" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <div className="relative group md:col-span-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search student, tutor or subject..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 border-none text-sm font-bold shadow-inner-sm transition-all"
                        style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-main)' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="rounded-2xl px-6 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/10 border-none text-sm font-bold cursor-pointer transition-all shadow-inner-sm"
                    style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-main)' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Session Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <select
                    className="rounded-2xl px-6 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/10 border-none text-sm font-bold cursor-pointer transition-all shadow-inner-sm"
                    style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-main)' }}
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                >
                    <option value="">All Payment Statuses</option>
                    <option value="Pending">Unpaid</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                </select>
                <button
                    onClick={() => { setSearch(''); setStatusFilter(''); setPaymentFilter(''); }}
                    className="px-6 py-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20"
                >
                    Clear Filters
                </button>
            </div>

            <div className="rounded-[2.5rem] border shadow-sm overflow-hidden transition-all duration-500" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student / Faculty</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject & Time</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Meta</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm" style={{ borderColor: 'var(--border-color)' }}>
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-20 text-center font-black text-slate-400 uppercase tracking-widest">Accessing Session Logs...</td></tr>
                            ) : bookings.length === 0 ? (
                                <tr><td colSpan={5} className="px-8 py-20 text-center font-black text-slate-400 uppercase tracking-widest">No Sessions Recorded</td></tr>
                            ) : bookings.map(booking => (
                                <tr key={booking._id} className="hover:bg-indigo-50/30 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-[10px]">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <div className="font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{booking.studentId?.name || 'Unknown Student'}</div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Student Asset</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-[10px]">
                                                    <GraduationCap size={14} />
                                                </div>
                                                <div>
                                                    <div className="font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{booking.teacherId?.name || 'Unknown Faculty'}</div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tutor Resource</div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="space-y-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                                {booking.teacherId?.subject || 'General'}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 font-bold">
                                                <Calendar size={14} />
                                                <span className="text-[11px] tabular-nums">{formatDate(booking.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 font-bold">
                                                <Clock size={14} />
                                                <span className="text-[11px] tabular-nums">{booking.timeSlot}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(booking.status)}`}>
                                            {booking.status === 'Completed' ? <CheckCircle2 size={12} /> : booking.status === 'Cancelled' ? <XCircle size={12} /> : <AlertCircle size={12} />}
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="space-y-2">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getPaymentStyle(booking.paymentStatus)}`}>
                                                <div className={`h-1.5 w-1.5 rounded-full ${booking.paymentStatus === 'Paid' ? 'bg-emerald-500' : booking.paymentStatus === 'Under Review' ? 'bg-indigo-500' : 'bg-slate-400'}`}></div>
                                                {booking.paymentStatus || 'Pending'}
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-400 font-black">
                                                <BadgeIndianRupee size={14} />
                                                <span className="text-xs">₹{booking.teacherId?.price || 0}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all">
                                            <ArrowUpRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Bookings;
