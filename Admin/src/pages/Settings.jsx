import React, { useState } from 'react';
import {
    User,
    Lock,
    Save,
    Shield,
    Eye,
    EyeOff,
    Mail,
    CheckCircle,
    KeyRound,
    Sparkles,
    Settings as SettingsIcon,
    ArrowRight,
    Fingerprint,
    ShieldCheck,
    Smartphone
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileSaving, setProfileSaving] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        try {
            const res = await api.put('/admin/profile', { name, email });
            if (res.data.success) {
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setPasswordSaving(true);
        try {
            const res = await api.put('/admin/change-password', {
                currentPassword,
                newPassword
            });
            if (res.data.success) {
                toast.success('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password change failed');
        } finally {
            setPasswordSaving(false);
        }
    };

    const tabs = [
        { key: 'profile', label: 'Identity', icon: User, desc: 'Personal Profile' },
        { key: 'security', label: 'Security', icon: Shield, desc: 'Privacy & Access' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in-up pb-24 px-4">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 dark:border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <SettingsIcon className="text-white" size={20} />
                        </div>
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400">System Preferences</h2>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter gradient-text leading-none">Settings</h1>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-2 px-6 rounded-[2rem] border border-slate-100 dark:border-white/5">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registry Active</p>
                    <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Last Sync: Just now</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="settings-card !rounded-[3rem] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-1000"></div>
                        
                        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                            <div className="relative">
                                <div className="h-32 w-32 rounded-[3.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-black text-4xl shadow-2xl ring-8 ring-indigo-500/5">
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                                    <ShieldCheck size={18} className="text-white" />
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{user?.name}</h3>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-2 bg-indigo-500/10 px-4 py-1.5 rounded-full inline-block">
                                    Super Administrator
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 space-y-3 relative z-10">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`w-full flex items-center gap-5 px-8 py-6 rounded-[2rem] transition-all duration-500 group relative ${activeTab === tab.key
                                        ? 'shadow-xl shadow-indigo-500/10'
                                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}
                                    style={{
                                        background: activeTab === tab.key ? 'var(--bg-surface)' : 'transparent',
                                        border: activeTab === tab.key ? '1px solid var(--border-color)' : '1px solid transparent',
                                    }}
                                >
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${activeTab === tab.key ? 'bg-indigo-600 text-white shadow-glow-indigo' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-500'}`}>
                                        <tab.icon size={20} className={activeTab === tab.key ? 'scale-110' : ''} />
                                    </div>
                                    <div className="text-left">
                                        <span className={`block text-base font-black tracking-tight leading-none ${activeTab === tab.key ? 'text-indigo-600 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{tab.label}</span>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1 block">{tab.desc}</span>
                                    </div>
                                    {activeTab === tab.key && (
                                        <div className="absolute right-8 text-indigo-600 animate-bounce-x">
                                            <ArrowRight size={18} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Security Metrics Card */}
                    <div className="settings-card !rounded-[3rem] p-10 bg-slate-900 text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-black uppercase tracking-widest opacity-60">Security Score</h4>
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <Sparkles size={20} className="text-indigo-400" />
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-6xl font-black tracking-tighter">94</span>
                                <span className="text-xl font-bold text-indigo-400 mb-2">/100</span>
                            </div>
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full w-[94%] shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
                            </div>
                            <p className="text-[10px] font-bold text-indigo-200/50 leading-relaxed">
                                Your account security protocols are currently operating at peak efficiency.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {activeTab === 'profile' && (
                        <div className="settings-card !rounded-[4rem] animate-fade-in-up">
                            <div className="settings-card-header !bg-transparent p-12">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                        <Fingerprint size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-main)' }}>Identity Designation</h2>
                                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Configure your global registry credentials</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleProfileUpdate} className="settings-card-body p-12 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="form-label">Global Alias</label>
                                        <div className="relative group">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                            <input
                                                type="text"
                                                required
                                                className="input-modern pl-16 !rounded-[2rem]"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter display name..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="form-label">Registry Comms</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                            <input
                                                type="email"
                                                required
                                                className="input-modern pl-16 !rounded-[2rem]"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="admin@learnhub.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={profileSaving}
                                        className="btn-primary !rounded-[2rem] hover:shadow-glow-indigo group"
                                    >
                                        {profileSaving ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <Save size={20} className="group-hover:scale-110 transition-transform" />
                                        )}
                                        {profileSaving ? 'Saving...' : 'Sync Registry'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-card !rounded-[4rem] animate-fade-in-up">
                            <div className="settings-card-header !bg-transparent p-12">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-3xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-main)' }}>Authentication Layer</h2>
                                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Rotate access protocols and verify security status</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handlePasswordChange} className="settings-card-body p-12 space-y-10">
                                <div className="space-y-4">
                                    <label className="form-label">Current Master Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            required
                                            className="input-modern pl-16 pr-16 !rounded-[2rem]"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
                                        >
                                            {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="form-label">New Sequence</label>
                                        <div className="relative group">
                                            <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                            <input
                                                type={showNew ? 'text' : 'password'}
                                                required
                                                className="input-modern pl-16 pr-16 !rounded-[2rem]"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNew(!showNew)}
                                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
                                            >
                                                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="form-label">Confirm Sequence</label>
                                        <div className="relative group">
                                            <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                            <input
                                                type="password"
                                                required
                                                className="input-modern pl-16 !rounded-[2rem]"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                            <Smartphone size={20} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-tight">
                                            2FA verification will be required <br/> upon next system access.
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={passwordSaving || newPassword !== confirmPassword || newPassword.length < 6}
                                        className="btn-primary !rounded-[2rem] hover:shadow-glow-indigo w-full md:w-auto"
                                    >
                                        {passwordSaving ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <KeyRound size={20} />
                                        )}
                                        {passwordSaving ? 'Updating...' : 'Commit Sequence'}
                                    </button>
                                </div>
                            </form>

                            {/* Security Tips */}
                            <div className="px-12 pb-12">
                                <div className="security-tips !rounded-[3rem] p-8 border-indigo-500/10 bg-indigo-500/5">
                                    <p className="flex items-center gap-2 mb-4">
                                        <ShieldCheck size={16} className="text-indigo-500" />
                                        Security Hardening Protocol
                                    </p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                                        <li className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                                            Minimum 8 characters for master keys
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                                            Incorporate specialized system glyphs
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                                            Avoid sequential numeric nodes
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                                            Rotate access keys every 90 cycles
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
