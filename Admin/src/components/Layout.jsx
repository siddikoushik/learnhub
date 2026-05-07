import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, ChevronDown, Calendar, Globe, SquareTerminal, LogOut } from 'lucide-react';

const Layout = () => {
    const { user, loading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('admin-theme') || 'light');
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('admin-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            <div className="text-center group">
                <div className="h-14 w-14 rounded-3xl border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 animate-spin mx-auto group-hover:scale-110 transition-transform shadow-xl"></div>
                <p className="mt-8 text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] opacity-80">Loading LearnHub</p>
            </div>
        </div>
    );

    if (!user) return <Navigate to="/login" />;

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/' || path === '/dashboard') return 'Core Dashboard';
        if (path === '/admin') return 'Registry Analytics';
        if (path === '/users') return 'User Directory';
        if (path === '/bookings') return 'Session Logs';
        if (path === '/tutor-approvals') return 'Faculty Verification';
        if (path === '/settings') return 'System Settings';
        return 'Admin Panel';
    };

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    });

    return (
        <div className="flex h-screen overflow-hidden transition-all duration-500" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
            <Sidebar />

            <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isDesktop ? 'pl-[288px]' : 'pl-0'} transition-all duration-500`}>
                {/* Header - Advanced Glassmorphism */}
                <header className="h-24 flex items-center justify-between px-12 sticky top-0 z-40 glass-effect border-b border-black/5 dark:border-white/5 shadow-premium transition-all duration-300">
                    <div className="flex items-center gap-8">
                        {!isDesktop && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-3 text-slate-400 hover:text-indigo-600 bg-white/5 rounded-2xl transition-all border border-white/10"
                            >
                                <Menu size={24} />
                            </button>
                        )}
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-main)' }}>{getPageTitle()}</h2>
                            <div className="flex items-center gap-4 mt-1.5 font-medium">
                                <span className="flex items-center gap-2 text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-500/5 px-2.5 py-1 rounded-lg border border-indigo-500/10">
                                    <SquareTerminal size={14} className="stroke-[2.5px]" /> Registry Active
                                </span>
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                <span className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                                    <Calendar size={14} className="stroke-[2.5px]" /> {currentDate}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className="p-3 text-slate-500 hover:text-indigo-600 bg-white/5 border border-white/10 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-sm"
                            title="Switch Theme"
                        >
                            <Globe size={20} className="stroke-[2.5px]" />
                        </button>

                        <div className="hidden md:flex items-center relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" size={20} />
                            <input
                                type="text"
                                placeholder="Universal Search..."
                                className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-14 pr-8 text-sm font-black w-72 focus:w-96 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all duration-500 placeholder:text-slate-400/80 shadow-inner-sm"
                                style={{ color: 'var(--text-main)' }}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">Esc</div>
                        </div>

                        <div className="h-10 w-[1.5px] bg-slate-200 dark:bg-slate-800 mx-3 hidden sm:block"></div>

                        {/* User Profile Hook */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-4 p-2 pr-6 pl-2 bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[1.5rem] hover:border-indigo-500/30 transition-all duration-500 group shadow-sm hover:shadow-glow-indigo active:scale-95 backdrop-blur-md"
                            >
                                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-800 flex items-center justify-center text-white font-black text-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-glow-indigo border border-white/20">
                                    {(user?.name || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="text-sm font-black tracking-tight leading-none" style={{ color: 'var(--text-main)' }}>{user?.name || 'Administrator'}</p>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-2 opacity-90">Systems Controller</p>
                                </div>
                                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-700 ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {profileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-scale-in">
                                        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Identity Signature</p>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-inner uppercase">
                                                    {(user?.name || 'A').charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user?.name}</p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-bold">{user?.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <button
                                                onClick={() => { setProfileOpen(false); logout(); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all group uppercase tracking-widest text-[10px]"
                                            >
                                                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                                                Terminate Session
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto scroll-modern" style={{ backgroundColor: 'var(--bg-main)' }}>
                    <div className="p-8 max-w-[1600px] mx-auto min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
