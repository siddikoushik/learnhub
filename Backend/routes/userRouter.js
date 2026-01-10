import express from 'express'
import { register, login, updateProfile, getProfile } from '../controllers/userController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.put('/profile', AuthMiddleware, updateProfile)
userRouter.get('/profile', AuthMiddleware, getProfile) // New generic profile fetch

export default userRouter