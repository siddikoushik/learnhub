import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck, ArrowRight, GraduationCap, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('login');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, verifyOTP, forgotPassword, resendOTP, user } = useAuth();

    if (user) return <Navigate to="/" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await login(email, password);
        if (res && res.requireOTP) {
            setStep('otp');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        await verifyOTP(email, otp);
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }} id="admin-login-page">
            {/* Left Panel - Decorative */}
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
                        Welcome Back<br />
                        <span style={{ color: '#818cf8' }}>Administrator</span><br />
                        System
                    </h1>
                </div>
            </div>

            {/* Right Panel - Form Area */}
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
                    
                    {step === 'login' ? (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: '#eef2ff', borderRadius: '12px', marginBottom: '16px' }}>
                                    <ShieldCheck size={24} style={{ color: '#6366f1' }} />
                                </div>
                                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>Admin Login</h1>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Enter your credentials to access the dashboard</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '20px' }}>
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

                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Password</label>
                                        <Link to="/forgot-password" style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</Link>
                                    </div>
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
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                                    {loading ? "Verifying..." : "Sign In"}
                                    <ArrowRight size={18} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: '#eef2ff', borderRadius: '12px', marginBottom: '16px' }}>
                                    <Lock size={24} style={{ color: '#6366f1' }} />
                                </div>
                                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>Verify Identity</h1>

                            </div>

                            <form onSubmit={handleVerifyOtp}>
                                <div style={{ marginBottom: '24px' }}>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '24px', fontWeight: 800, textAlign: 'center', letterSpacing: '8px', outline: 'none', border: '2px solid #6366f1' }}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
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
                                        opacity: (loading || otp.length !== 6) ? 0.5 : 1
                                    }}
                                >
                                    {loading ? "Verifying..." : "Verify OTP"}
                                </button>
                                
                                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                        Didn't receive code?{' '}
                                        <button 
                                            type="button" 
                                            onClick={() => resendOTP(email)}
                                            style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                        >
                                            Resend OTP
                                        </button>
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep('login')}
                                    style={{ width: '100%', background: 'none', border: 'none', marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    Back to Login
                                </button>
                            </form>
                        </>
                    )}

                    <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                        Don't have an admin account?{' '}
                        <Link to="/signup" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Create Account</Link>
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    #admin-login-page > div:first-child { display: none !important; }
                    #admin-login-page > div:last-child { width: 100% !important; }
                }
            `}</style>
        </div>
    );
};

export default Login;

