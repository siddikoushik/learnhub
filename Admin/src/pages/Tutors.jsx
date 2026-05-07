import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    GraduationCap,
    FileText,
    Search,
    Filter,
    Eye,
    X,
    Mail,
    Briefcase,
    DollarSign,
    Monitor,
    ShieldCheck,
    Check,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const TutorApprovals = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(null);

    const fetchTutors = async () => {
        setLoading(true);
        try {
            const params = { role: 'teacher' };
            if (activeTab !== 'all') params.verification = activeTab;
            if (search) params.search = search;

            const res = await api.get('/admin/users', { params });
            if (res.data.success) {
                const sorted = res.data.users.sort((a, b) => {
                    if (a.verificationStatus === 'pending' && b.verificationStatus !== 'pending') return -1;
                    if (a.verificationStatus !== 'pending' && b.verificationStatus === 'pending') return 1;
                    return 0;
                });
                setTutors(sorted);
            }
        } catch (error) {
            toast.error("Failed to load tutor applications");
        } finally {
            setTimeout(() => setLoading(false), 300);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTutors();
        }, 300);
        return () => clearTimeout(timer);
    }, [activeTab, search]);

    const handleVerification = async (id, status) => {
        try {
            const res = await api.patch(`/admin/tutor-verification/${id}`, { verificationStatus: status });
            if (res.data.success) {
                toast.success(`Tutor ${status} successfully`);
                fetchTutors();
                if (showDetailModal?._id === id) {
                    setShowDetailModal(null);
                }
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const StatusBadge = ({ status }) => {
        const config = {
            pending: { bg: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30', icon: <Clock size={11} />, label: 'Review Pending' },
            approved: { bg: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30', icon: <CheckCircle size={11} />, label: 'Verified Tutor' },
            rejected: { bg: 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30', icon: <XCircle size={11} />, label: 'Access Denied' }
        };
        const c = config[status] || config.pending;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${c.bg}`}>
                {c.icon}
                {c.label}
            </span>
        );
    };

    const tabs = [
        { key: 'all', label: 'All Candidates', icon: UsersIcon },
        { key: 'pending', label: 'Under Review', icon: Clock },
        { key: 'approved', label: 'Authorized', icon: CheckCircle },
        { key: 'rejected', label: 'Restricted', icon: XCircle }
    ];

    return (
        <div className="space-y-8 animate-fade-in-up pb-20">
            {/* Header / Hero Section */}
            <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-end">
                <div className="flex-1">
                    <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Faculty Verification</h1>
                    <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ShieldCheck size={16} className="text-indigo-600" />
                        Candidate Assessment Queue ({tutors.length} Profiles)
                    </p>
                </div>
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl shadow-inner-sm border border-slate-100 dark:border-slate-800 self-start lg:self-auto overflow-x-auto whitespace-nowrap scroll-none">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                                activeTab === tab.key 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                : 'text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Filter & Search */}
            <div className="card-premium p-8 rounded-[2.5rem] border shadow-sm" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <div className="relative group/search max-w-2xl">
                    <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by faculty name, subject or expertise..."
                        className="w-full pl-16 pr-6 py-4 rounded-2xl shadow-inner-sm text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all border-none"
                        style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-main)' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tutor Grid */}
            <div className="grid grid-cols-1 gap-8">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 shimmer rounded-[3rem] opacity-20"></div>)
                ) : tutors.length === 0 ? (
                    <div className="card-premium py-40 text-center rounded-[4rem] border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <div className="max-w-xs mx-auto">
                            <div className="h-32 w-32 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                                 <TrendingUp size={64} className="text-slate-200 dark:text-slate-800" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Queue Empty</h3>
                            <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em] mt-3">All candidates processed</p>
                        </div>
                    </div>
                ) : tutors.map((tutor) => (
                    <div key={tutor._id} className="card-premium p-10 overflow-hidden group/card relative flex flex-col lg:flex-row gap-10 items-start lg:items-center rounded-[3rem] border shadow-sm hover:shadow-premium transition-all duration-500" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        {/* Status Marker */}
                        <div className={`absolute top-0 left-0 w-full h-2 ${
                            (tutor.verificationStatus || 'pending') === 'approved' ? 'bg-emerald-500' : 
                            (tutor.verificationStatus || 'pending') === 'rejected' ? 'bg-rose-500' : 'bg-amber-400'
                        } opacity-20`}></div>

                        {/* Profile Visual */}
                        <div className="relative shrink-0">
                            <div className="h-28 w-28 rounded-[2rem] bg-slate-50 dark:bg-slate-950 overflow-hidden border-2 border-white dark:border-slate-800 shadow-xl group-hover/card:scale-105 transition-transform duration-500 ring-8 ring-indigo-500/5">
                                {tutor.profileImage ? (
                                    <img src={`http://localhost:5001/images/${tutor.profileImage}`} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 text-indigo-400">
                                        <GraduationCap size={48} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Core Identity */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                                <h3 className="text-3xl font-black tracking-tight truncate" style={{ color: 'var(--text-main)' }}>{tutor.name}</h3>
                                <StatusBadge status={tutor.verificationStatus || 'pending'} />
                            </div>
                            
                            <div className="flex flex-wrap gap-y-4 gap-x-10 mb-8">
                                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><Mail size={14} /></div>
                                    <span className="truncate">{tutor.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Briefcase size={14} /></div>
                                    {tutor.experience || 0} years Exp.
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><GraduationCap size={14} /></div>
                                    {tutor.subject || 'Specialist'}
                                </div>
                            </div>

                            {tutor.bio && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-2xl line-clamp-2 italic opacity-80 border-l-4 border-indigo-500/20 pl-6">
                                    "{tutor.bio}"
                                </p>
                            )}
                        </div>

                        {/* Administrative Controls */}
                        <div className="flex flex-row lg:flex-col gap-4 shrink-0 lg:w-56 w-full">
                            {(tutor.verificationStatus || 'pending') === 'pending' ? (
                                <>
                                    <button
                                        onClick={() => handleVerification(tutor._id, 'approved')}
                                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest font-black shadow-glow-indigo hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <CheckCircle size={18} /> Authorize
                                    </button>
                                    <button
                                        onClick={() => handleVerification(tutor._id, 'rejected')}
                                        className="flex-1 py-4 bg-rose-500/10 text-rose-600 font-black rounded-2xl hover:bg-rose-600 hover:text-white transition-all text-[10px] flex items-center justify-center gap-3 border border-rose-500/20 uppercase tracking-widest"
                                    >
                                        <XCircle size={18} /> Deny Access
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleVerification(tutor._id, 'pending')}
                                    className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-400 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                                >
                                    <Clock size={16} /> Rollback Status
                                </button>
                            )}
                            <button
                                onClick={() => setShowDetailModal(tutor)}
                                className="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 font-black rounded-2xl hover:bg-indigo-100 transition-all text-[10px] flex items-center justify-center gap-3 border border-indigo-200 dark:border-indigo-500/20 uppercase tracking-widest"
                            >
                                <Eye size={18} /> Profile Dossier
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Profile Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-[4rem] shadow-2xl relative overflow-hidden animate-scale-in my-auto border border-white/10" style={{ background: 'var(--bg-surface)' }}>
                        <div className="absolute top-0 left-0 w-full h-2.5 bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
                        
                        <div className="p-12">
                            <div className="flex justify-between items-start mb-12">
                                <div className="flex gap-8 items-center">
                                    <div className="h-28 w-28 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl ring-8 ring-indigo-500/5">
                                        {showDetailModal.profileImage ? (
                                            <img src={`http://localhost:5001/images/${showDetailModal.profileImage}`} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <GraduationCap size={56} className="text-indigo-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black tracking-tight leading-none mb-4" style={{ color: 'var(--text-main)' }}>{showDetailModal.name}</h2>
                                        <StatusBadge status={showDetailModal.verificationStatus || 'pending'} />
                                    </div>
                                </div>
                                <button onClick={() => setShowDetailModal(null)} className="p-4 bg-slate-50 dark:bg-slate-900 hover:bg-rose-500/10 hover:text-rose-500 rounded-3xl text-slate-400 transition-all border border-transparent hover:border-rose-500/20">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-12">
                                {[
                                    { l: 'Instructional Field', v: showDetailModal.subject || 'Specialist', i: GraduationCap, c: 'text-emerald-500', bc: 'bg-emerald-500/10' },
                                    { l: 'Mode of Operation', v: showDetailModal.mode || 'Universal', i: Monitor, c: 'text-cyan-500', bc: 'bg-cyan-500/10' },
                                    { l: 'Professional Tenure', v: `${showDetailModal.experience || 0} Years`, i: Briefcase, c: 'text-amber-500', bc: 'bg-amber-500/10' },
                                    { l: 'Registry Fee', v: `₹${showDetailModal.price || 0}`, i: DollarSign, c: 'text-indigo-500', bc: 'bg-indigo-500/10' },
                                    { l: 'Registry Identifier', v: `#FAC-${showDetailModal._id?.slice(-6).toUpperCase()}`, i: ShieldCheck, c: 'text-slate-400', bc: 'bg-slate-400/10' },
                                    { l: 'Availability Node', v: 'Active Priority', i: Clock, c: 'text-rose-400', bc: 'bg-rose-400/10' },
                                ].map((item, id) => (
                                    <div key={id} className="flex gap-5 items-start group">
                                        <div className={`p-3.5 rounded-2xl ${item.bc} ${item.c} border border-transparent group-hover:scale-110 transition-transform duration-300 shadow-sm`}><item.i size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-60">{item.l}</p>
                                            <p className="text-lg font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{item.v}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {showDetailModal.bio && (
                                <div className="mb-12 p-10 rounded-[3rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 relative group shadow-inner">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] absolute -top-3 left-10 bg-white dark:bg-slate-900 px-4 py-1 rounded-full border border-slate-100 dark:border-slate-800">Mission Statement</p>
                                    <p className="text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic opacity-90">"{showDetailModal.bio}"</p>
                                </div>
                            )}

                            {(showDetailModal.verificationStatus || 'pending') === 'pending' && (
                                <div className="flex gap-5">
                                    <button
                                        onClick={() => handleVerification(showDetailModal._id, 'approved')}
                                        className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center gap-3 font-black tracking-widest uppercase text-xs shadow-glow-indigo hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <CheckCircle size={22} /> Validate Identity
                                    </button>
                                    <button
                                        onClick={() => handleVerification(showDetailModal._id, 'rejected')}
                                        className="px-10 py-5 bg-rose-500/10 text-rose-600 font-black rounded-[2rem] hover:bg-rose-500 hover:text-white transition-all flex items-center gap-3 border border-rose-500/20 uppercase tracking-widest text-xs"
                                    >
                                        <XCircle size={22} /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Mock UsersIcon for internal usage in tabs
const UsersIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default TutorApprovals;
