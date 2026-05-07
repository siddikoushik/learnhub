import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    updateTutorVerification,
    deleteUser,
    updateUserDetails,
    getRecentActivity,
    changeAdminPassword,
    updateAdminProfile,
    getAllBookings
} from '../controllers/adminController.js';
import AdminMiddleware from '../middleware/AdminMiddleware.js';

const adminRouter = express.Router();

// All routes are protected by AdminMiddleware
adminRouter.use(AdminMiddleware);

adminRouter.get('/dashboard-stats', getDashboardStats);
adminRouter.get('/users', getAllUsers);
adminRouter.get('/activity', getRecentActivity);
adminRouter.patch('/user-status/:id', updateUserStatus);
adminRouter.patch('/tutor-verification/:id', updateTutorVerification);
adminRouter.put('/user/:id', updateUserDetails);
adminRouter.delete('/user/:id', deleteUser);
adminRouter.put('/change-password', changeAdminPassword);
adminRouter.put('/profile', updateAdminProfile);
adminRouter.get('/bookings', getAllBookings);

export default adminRouter;
