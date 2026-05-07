import userModel from "../models/UserModel.js";
import bookingModel from "../models/BookingModel.js";
import bcrypt from "bcryptjs";

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard-stats
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments({ role: { $ne: 'admin' } });
        const activeUsers = await userModel.countDocuments({ role: { $ne: 'admin' }, isActive: true });
        const inactiveUsers = await userModel.countDocuments({ role: { $ne: 'admin' }, isActive: false });
        const totalTeachers = await userModel.countDocuments({ role: 'teacher' });
        const totalStudents = await userModel.countDocuments({ role: 'student' });
        const pendingApprovals = await userModel.countDocuments({ role: 'teacher', verificationStatus: 'pending' });
        const approvedTutors = await userModel.countDocuments({ role: 'teacher', verificationStatus: 'approved' });
        const rejectedTutors = await userModel.countDocuments({ role: 'teacher', verificationStatus: 'rejected' });

        // Total bookings
        const totalBookings = await bookingModel.countDocuments();

        // Growth data (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const growthData = await userModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    role: { $ne: 'admin' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Monthly growth (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyGrowth = await userModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    role: { $ne: 'admin' }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        role: "$role"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.month": 1 } }
        ]);

        // Transform monthly growth for frontend
        const monthlyMap = {};
        monthlyGrowth.forEach(item => {
            const month = item._id.month;
            if (!monthlyMap[month]) monthlyMap[month] = { month, students: 0, teachers: 0 };
            if (item._id.role === 'student') monthlyMap[month].students = item.count;
            if (item._id.role === 'teacher') monthlyMap[month].teachers = item.count;
        });
        const monthlyData = Object.values(monthlyMap);

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                totalTeachers,
                totalStudents,
                pendingApprovals,
                approvedTutors,
                rejectedTutors,
                totalBookings
            },
            growthData,
            monthlyData
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const { role, status, search, verification } = req.query;
        let query = { role: { $ne: 'admin' } };

        if (role) query.role = role;
        if (status) query.isActive = status === 'active';
        if (verification) query.verificationStatus = verification;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await userModel.find(query).sort({ createdAt: -1 }).select('-password');
        res.json({ success: true, users });
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update user status (activate/deactivate)
// @route   PATCH /api/admin/user-status/:id
export const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await userModel.findByIdAndUpdate(req.params.id, { isActive }, { new: true });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user });
    } catch (error) {
        console.error("Update User Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update tutor verification
// @route   PATCH /api/admin/tutor-verification/:id
export const updateTutorVerification = async (req, res) => {
    try {
        const { verificationStatus } = req.body;
        // Only update verificationStatus — do NOT touch isVerified (email verification flag)
        const user = await userModel.findByIdAndUpdate(req.params.id, {
            verificationStatus,
        }, { new: true });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: `Tutor ${verificationStatus} successfully`, user });
    } catch (error) {
        console.error("Update Tutor Verification Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
export const deleteUser = async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update user details
// @route   PUT /api/admin/user/:id
export const updateUserDetails = async (req, res) => {
    try {
        const updates = req.body;
        const user = await userModel.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).select('-password');

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "User updated successfully", user });
    } catch (error) {
        console.error("Update User Details Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get recent activity (from registrations and logins)
// @route   GET /api/admin/activity
export const getRecentActivity = async (req, res) => {
    try {
        const recentUsers = await userModel.find({ role: { $ne: 'admin' } })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name email role createdAt lastLogin verificationStatus isActive');

        const activity = recentUsers.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            verificationStatus: user.verificationStatus,
            type: user.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000) ? 'registration' : 'login',
            timestamp: user.lastLogin || user.createdAt
        }));

        res.json({ success: true, activity });
    } catch (error) {
        console.error("Recent Activity Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update admin password
// @route   PUT /api/admin/change-password
export const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        }

        const admin = await userModel.findById(req.userId);
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        await admin.save();

        res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
export const updateAdminProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const admin = await userModel.findByIdAndUpdate(
            req.userId,
            { $set: { name, email } },
            { new: true }
        ).select('-password');

        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

        res.json({ success: true, message: "Profile updated successfully", user: admin });
    } catch (error) {
        console.error("Update Admin Profile Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
// @desc    Get all bookings with filtering
// @route   GET /api/admin/bookings
export const getAllBookings = async (req, res) => {
    try {
        const { status, search, paymentStatus } = req.query;
        let query = {};

        if (status) query.status = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;

        const bookings = await bookingModel.find(query)
            .populate('studentId', 'name email image')
            .populate('teacherId', 'name email image subject price')
            .sort({ createdAt: -1 });

        if (search) {
            const searchLower = search.toLowerCase();
            const filteredBookings = bookings.filter(b => 
                (b.studentId?.name?.toLowerCase().includes(searchLower)) ||
                (b.teacherId?.name?.toLowerCase().includes(searchLower)) ||
                (b.teacherId?.subject?.toLowerCase().includes(searchLower))
            );
            return res.json({ success: true, bookings: filteredBookings });
        }

        res.json({ success: true, bookings });
    } catch (error) {
        console.error("Get All Bookings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
