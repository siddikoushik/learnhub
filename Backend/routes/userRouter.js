import express from 'express'
import { register, login, updateProfile, getProfile, getPlatformStats, verifyOTP, resendOTP, forgotPassword, resetPassword, uploadFiles } from '../controllers/userController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.post('/verify-otp', verifyOTP)
userRouter.post('/resend-otp', resendOTP)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password', resetPassword)
userRouter.put('/profile', AuthMiddleware, updateProfile)
userRouter.get('/profile', AuthMiddleware, getProfile) // New generic profile fetch
userRouter.get('/stats', getPlatformStats) // Public stats endpoint

userRouter.post('/upload', AuthMiddleware, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'qrCode', maxCount: 1 }
]), uploadFiles)

export default userRouter