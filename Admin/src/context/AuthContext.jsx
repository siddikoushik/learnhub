import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkLogin = async () => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    const res = await api.get('/user/profile');
                    if (res.data.success && res.data.user.role === 'admin') {
                        setUser(res.data.user);
                    } else {
                        localStorage.removeItem('adminToken');
                    }
                } catch (error) {
                    console.error("Auth initialization failed", error);
                    localStorage.removeItem('adminToken');
                }
            }
            setLoading(false);
        };
        checkLogin();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/user/login', { email, password });
            if (res.data.success) {
                if (res.data.requireOTP) {
                    return { requireOTP: true, email };
                }
                if (res.data.user.role === 'admin') {
                    localStorage.setItem('adminToken', res.data.token);
                    setUser(res.data.user);
                    toast.success('Login Successful');
                    navigate('/');
                    return { success: true };
                } else {
                    toast.error('Access denied. Not an admin.');
                    return { success: false };
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return { success: false };
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const res = await api.post('/user/verify-otp', { email, otp });
            if (res.data.success) {
                localStorage.setItem('adminToken', res.data.token);
                setUser(res.data.user);
                toast.success('Verification Successful');
                navigate('/');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'OTP Verification failed');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/user/register', { ...userData, role: 'admin' });
            if (res.data.success) {
                if (res.data.token) {
                    localStorage.setItem('adminToken', res.data.token);
                    setUser(res.data.user);
                    toast.success('Registration successful!');
                    navigate('/');
                    return { success: true };
                }
                toast.success(res.data.message || 'OTP sent to your email');
                return { requireOTP: true, email: userData.email };
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return { success: false };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const res = await api.post('/user/forgot-password', { email });
            if (res.data.success) {
                toast.success(res.data.message || 'Reset code sent to email');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset code');
            return false;
        }
    };

    const resetPassword = async (data) => {
        try {
            const res = await api.post('/user/reset-password', data);
            if (res.data.success) {
                toast.success(res.data.message || 'Password reset successful');
                navigate('/login');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
            return false;
        }
    };

    const resendOTP = async (email) => {
        try {
            const res = await api.post('/user/resend-otp', { email });
            if (res.data.success) {
                toast.success(res.data.message || 'OTP resent successfully');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setUser(null);
        navigate('/login');
        toast.info('Logged out');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            verifyOTP, 
            forgotPassword, 
            resetPassword, 
            resendOTP,
            logout, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
