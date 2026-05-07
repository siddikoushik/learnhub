import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    GraduationCap,
    TrendingUp,
    ShieldCheck,
    Activity,
    ChevronRight,
    Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { group: 'Main Overview', items: [
            { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/admin', icon: Activity, label: 'Admin Insights' },
        ]},
        { group: 'User Management', items: [
            { path: '/users', icon: Users, label: 'Manage All Users' },
            { path: '/bookings', icon: Calendar, label: 'Session Registry' },
            { path: '/tutor-approvals', icon: ShieldCheck, label: 'Tutor Approvals' },
            { path: '/verifications', icon: ShieldCheck, label: 'Payment Verifications' },
        ]},
        { group: 'System', items: [
            { path: '/settings', icon: Settings, label: 'Settings' },
        ]}
    ];

    return (
        <div className="w-80 h-screen fixed left-0 top-0 flex flex-col z-50 transition-all duration-500 border-r" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
            {/* Branding Section */}
            <div className="p-10 pb-8 flex items-center gap-5 border-b relative group cursor-pointer overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform duration-500 relative z-10">
                    <GraduationCap size={32} className="text-white" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-black tracking-tighter m-0 leading-none">LearnHub</h1>
                    <p className="text-[10px] uppercase font-black text-indigo-500 tracking-[0.3em] mt-2">Management</p>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 py-10 overflow-y-auto px-6 space-y-12 scroll-modern">
                {navItems.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-4">
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                            {group.group}
                        </p>
                        <div className="space-y-2">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group
                                        ${isActive 
                                            ? 'bg-indigo-600/10 text-indigo-600 font-black border border-indigo-500/20 shadow-xl' 
                                            : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-white/5'
                                        }
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <item.icon size={20} className={`transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : 'group-hover:text-indigo-600 group-hover:scale-110'}`} />
                                                <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                            </div>
                                            {isActive && <ChevronRight size={14} className="text-indigo-600 animate-pulse" />}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Profile Footer */}
            <div className="p-6 border-t" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
                <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 space-y-5 border" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg border border-white/10">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate">{user?.name || 'Admin'}</p>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Super Admin</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 transition-all border border-slate-100 dark:border-white/5 text-xs font-black uppercase tracking-[0.2em]"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
