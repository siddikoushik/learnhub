import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, Lock, Key, ShieldCheck, ArrowRight, GraduationCap, Eye, EyeOff, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState('request'); // 'request', 'reset', 'success'
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { forgotPassword, resetPassword } = useAuth();

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await forgotPassword(email);
        if (success) {
            setStep('reset');
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return alert("Passwords do not match");
        }
        setLoading(true);
        const success = await resetPassword({ email, otp, newPassword });
        if (success) {
            setStep('success');
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }} id="admin-forgot-page">
            {/* Left Panel */}
            <div className="sidebar-gradient" style={{
                flex: '1 1 0%',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '48px 64px'
            }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
                    <div style={{ position: 'absolute', top: '80px', left: '80px', width: '288px', height: '288px', background: '#818cf8', borderRadius: '50%', filter: 'blur(48px)' }}></div>
                    <div style={{ position: 'absolute', bottom: '80px', right: '40px', width: '384px', height: '384px', background: '#8b5cf6', borderRadius: '50%', filter: 'blur(48px)' }}></div>
                </div>

                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ height: '56px', width: '56px', borderRadius: '16px', background: 'rgba(79,70,229,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99,102,241,0.3)' }}>
                            <GraduationCap size={28} style={{ color: '#a5b4fc' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>LearnHub</h2>
                            <p style={{ color: '#818cf8', fontSize: '14px', fontWeight: 500, margin: 0 }}>Administration Portal</p>
                        </div>
                    </div>
                    <h1 style={{ fontSize: '40px', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '0 0 16px' }}>
                        Secure Your<br />
                        <span style={{ color: '#818cf8' }}>Admin Account</span><br />
                        Recovery
                    </h1>
                </div>
            </div>

            {/* Right Panel */}
            <div style={{
                flex: '0 0 auto',
                width: '520px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '48px',
                background: 'var(--bg-surface)'
            }}>
                <div style={{ width: '100%', maxWidth: '380px' }}>
                    
                    {step === 'request' && (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: '#eef2ff', borderRadius: '12px', marginBottom: '16px' }}>
                                    <Key size={24} style={{ color: '#6366f1' }} />
                                </div>
                                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>Forgot Password?</h1>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>No worries, we'll send you recovery instructions.</p>
                            </div>

                            <form onSubmit={handleRequestCode}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            className="input-modern"
                                            style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                                            placeholder="admin@learnhub.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        background: '#6366f1',
                                        fontWeight: 700,
                                        fontSize: '14px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        opacity: loading ? 0.5 : 1
                                    }}
                                >
                                    {loading ? "Sending..." : "Reset Password"}
                                    <ArrowRight size={18} />
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'reset' && (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: '#eef2ff', borderRadius: '12px', marginBottom: '16px' }}>
                                    <ShieldCheck size={24} style={{ color: '#6366f1' }} />
                                </div>
                                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>Reset Password</h1>

                            </div>

                            <form onSubmit={handleResetPassword}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Verification Code</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '18px', fontWeight: 800, textAlign: 'center', letterSpacing: '4px', outline: 'none', border: '1px solid #e2e8f0' }}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="input-modern"
                                            style={{ width: '100%', padding: '12px 44px 12px 40px', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', top: '50%', right: '14px', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Confirm Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                            <CheckCircle size={16} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="input-modern"
                                            style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        background: '#6366f1',
                                        fontWeight: 700,
                                        fontSize: '14px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                                        opacity: loading ? 0.5 : 1
                                    }}
                                >
                                    {loading ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'success' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#f0fdf4', borderRadius: '50%', marginBottom: '24px' }}>
                                <CheckCircle size={48} style={{ color: '#22c55e' }} />
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px' }}>Password Changed!</h1>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>Your password has been successfully updated. You can now log in with your new password.</p>
                            <Link 
                                to="/login" 
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    background: '#6366f1',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 14px rgba(99,102,241,0.3)'
                                }}
                            >
                                Back to Login
                            </Link>
                        </div>
                    )}

                    {step !== 'success' && (
                        <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                            Remember your password?{' '}
                            <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
                        </p>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    #admin-forgot-page > div:first-child { display: none !important; }
                    #admin-forgot-page > div:last-child { width: 100% !important; }
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
