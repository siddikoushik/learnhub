import React, { useState, useEffect } from 'react';
import {
    Search,
    Edit,
    Trash2,
    UserX,
    UserCheck,
    X,
    AlertTriangle,
    Users as UsersIcon,
    Filter,
    ShieldCheck,
    GraduationCap,
    Clock,
    Mail
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users', {
                params: {
                    role: roleFilter,
                    status: statusFilter,
                    search: search
                }
            });
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, roleFilter, statusFilter]);

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const res = await api.patch(`/admin/user-status/${id}`, { isActive: !currentStatus });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers();
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const res = await api.delete(`/admin/user/${id}`);
            if (res.data.success) {
                toast.success(res.data.message);
                setShowDeleteConfirm(null);
                fetchUsers();
            }
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await api.put(`/admin/user/${selectedUser._id}`, {
                name: selectedUser.name,
                email: selectedUser.email,
                role: selectedUser.role,
                subject: selectedUser.subject,
                experience: selectedUser.experience,
                bio: selectedUser.bio,
                phone: selectedUser.phone,
                education: selectedUser.education
            });
            if (res.data.success) {
                toast.success("User updated successfully");
                setShowModal(false);
                fetchUsers();
            }
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const activeCount = users.filter(u => u.isActive).length;
    const inactiveCount = users.filter(u => !u.isActive).length;

    return (
        <div className="p-6 space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b pb-6" style={{ borderColor: 'var(--border-color)' }}>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>User Registry</h1>
                <div className="flex gap-4">
                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        Active Assets: {activeCount}
                    </div>
                    <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                        Restricted: {inactiveCount}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-[2rem] border shadow-sm transition-all duration-500" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <div className="relative group md:col-span-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search Registry..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 border-none text-sm font-bold shadow-inner-sm transition-all"
                        style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-main)' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="rounded-2xl px-6 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/10 border-none text-sm font-bold cursor-pointer transition-all shadow-inner-sm"
                    style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-main)' }}
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">All Designations</option>
                    <option value="student">Students</option>
                    <option value="teacher">Faculty</option>
                </select>
                <select
                    className="rounded-2xl px-6 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/10 border-none text-sm font-bold cursor-pointer transition-all shadow-inner-sm"
                    style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-main)' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Operational Status</option>
                    <option value="active">Online / Active</option>
                    <option value="inactive">Offline / Locked</option>
                </select>
                <button
                    onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); }}
                    className="px-6 py-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20"
                >
                    Reset Filters
                </button>
            </div>

            <div className="rounded-[2.5rem] border shadow-sm overflow-hidden transition-all duration-500" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Signature</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered At</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Directives</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm" style={{ borderColor: 'var(--border-color)' }}>
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-20 text-center font-black text-slate-400 uppercase tracking-widest">Accessing Registry...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="px-8 py-20 text-center font-black text-slate-400 uppercase tracking-widest">No Matches Located</td></tr>
                            ) : users.map(user => (
                                <tr key={user._id} className="hover:bg-indigo-50/30 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-glow-indigo">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{user.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${user.role === 'teacher' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'}`}>
                                            {user.role === 'teacher' ? <GraduationCap size={12} /> : <UsersIcon size={12} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${user.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            {user.isActive ? 'Online' : 'Restricted'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-slate-400 font-bold tabular-nums">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedUser({ ...user }); setShowModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-indigo-500/20 transition-all"><Edit size={16} /></button>
                                            <button onClick={() => handleToggleStatus(user._id, user.isActive)} className={`p-2 rounded-xl border border-transparent transition-all ${user.isActive ? 'text-amber-500 hover:text-amber-600 bg-amber-500/5 hover:border-amber-500/20' : 'text-emerald-500 hover:text-emerald-600 bg-emerald-500/5 hover:border-emerald-500/20'}`}>
                                                {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                            </button>
                                            <button onClick={() => setShowDeleteConfirm(user)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-scale-in border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Adjust Profile</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Alias Name</label>
                                <input type="text" className="w-full px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 border-none text-sm font-bold shadow-inner-sm transition-all" style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-main)' }} value={selectedUser.name} onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Comms Address</label>
                                <input type="email" className="w-full px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 border-none text-sm font-bold shadow-inner-sm transition-all" style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-main)' }} value={selectedUser.email} onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">System Designation</label>
                                <select className="w-full px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 border-none text-sm font-bold shadow-inner-sm transition-all cursor-pointer" style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-main)' }} value={selectedUser.role} onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}>
                                    <option value="student">Student Account</option>
                                    <option value="teacher">Faculty Member</option>
                                </select>
                            </div>
                            <div className="flex gap-4 mt-12">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Cancel</button>
                                <button type="submit" disabled={updating} className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-glow-indigo hover:scale-105 active:scale-95 transition-all">{updating ? 'Syncing...' : 'Confirm Changes'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="rounded-[3rem] max-w-sm w-full p-10 text-center shadow-2xl animate-scale-in border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <div className="h-20 w-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                            <AlertTriangle className="text-rose-500" size={40} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-3" style={{ color: 'var(--text-main)' }}>Wipe Protocol?</h3>
                        <p className="text-slate-400 font-bold text-sm mb-10 leading-relaxed">Are you sure you want to purge <span className="text-indigo-500">{showDeleteConfirm.name}</span>? This action is irreversible.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Abort</button>
                            <button onClick={() => handleDeleteUser(showDeleteConfirm._id)} className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all">Purge</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
