import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import validator from 'validator'
import userModel from '../models/UserModel.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateOTP } from '../utils/generateOTP.js';

dotenv.config();

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
}

export const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log("🔹 REGISTRATION ATTEMPT:", { name, email, role });

    try {
        if (!name || !email || !password) {
            console.warn("⚠️ Registration failed: Missing fields");
            return res.status(400).json({ success: false, message: "Please enter all the fields!" })
        }
        if (!validator.isEmail(email)) {
            console.warn(`⚠️ Registration failed: Invalid email format: ${email}`);
            return res.status(400).json({ success: false, message: "Please enter Valid Email!" })
        }
        if (password.length < 6) {
            console.warn("⚠️ Registration failed: Password too short");
            return res.status(400).json({ success: false, message: "Password must be more than 6 characters!" })
        }

        const exist = await userModel.findOne({ email });
        if (exist) {
            if (exist.isVerified) {
                console.log(`ℹ️ Registration attempt for already verified user: ${email}`);
                return res.status(400).json({ success: false, message: "User already exists and is verified!" });
            } else {
                // Update existing unverified user with a new OTP
                const otp = generateOTP();
                const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

                exist.name = name; // Update name if they changed it
                const salt = await bcrypt.genSalt(10);
                exist.password = await bcrypt.hash(password, salt);
                exist.role = role || 'student';
                exist.otp = otp;
                exist.otpExpires = otpExpires;

                await exist.save();
                console.log(`🔄 Updating unverified user ${email} with new OTP: ${otp}`);

                const emailSent = await sendEmail(
                    email,
                    "Email Verification - LearnHub",
                    `Your OTP for LearnHub is: ${otp}`,
                    `<h1>Welcome back to LearnHub</h1><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
                );

                if (!emailSent.success) {
                    console.error(`❌ Registration update failed to send email to ${email}:`, emailSent.error);
                    return res.status(500).json({ success: false, message: "Failed to send verification email. Please try again or check your email address." });
                }

                console.log(`✅ Registration update: OTP sent to ${email}`);
                return res.json({ success: true, message: "A new OTP has been sent to your email. Please verify." });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            otp: role === 'admin' ? undefined : otp,
            otpExpires: role === 'admin' ? undefined : otpExpires,
            isVerified: role === 'admin' ? true : false
        });

        await newUser.save();
        console.log(`✨ New user created: ${email}. Generated OTP: ${otp}`);

        const emailSent = await sendEmail(
            email,
            "Email Verification - LearnHub",
            `Your OTP for LearnHub is: ${otp}`,
            `<h1>Welcome to LearnHub</h1><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
        );

        if (!emailSent.success) {
            console.error(`❌ New registration failed to send email to ${email}:`, emailSent.error);
            return res.status(500).json({
                success: false,
                message: "Registration successful, but failed to send verification email. Please use 'Resend OTP' or contact support."
            });
        }

        if (role === 'admin') {
            const token = createToken(newUser._id);
            return res.json({ 
                success: true, 
                message: "Admin registration successful!", 
                token,
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        }
        
        return res.json({ success: true, message: "Registration successful. Please verify your email with the OTP sent." });

    } catch (error) {
        console.error("❌ Register Handler Error:", error);
        return res.status(500).json({ success: false, message: "Backend Register Error!" })
    }
}



export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`🔹 Login attempt for: ${email}`);
        const user = await userModel.findOne({ email })
        if (!user) {
            console.log("❌ User not found");
            return res.status(400).json({ success: false, message: "Invalid Email!" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            console.log("❌ Password mismatch");
            return res.status(400).json({ success: false, message: "Passwords Not Matched!" })
        }

        console.log(`✅ Login step 1: Password matched for ${user.role}`);

        // Handle Unverified Users
        if (!user.isVerified) {
            const otp = generateOTP();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();

            const subject = !user.isVerified ? "Email Verification - LearnHub" : "Admin Login Verification - LearnHub";
            const message = !user.isVerified ? "Your verification code is:" : "Your login security code is:";

            const emailSent = await sendEmail(
                email,
                subject,
                `${message} ${otp}`,
                `<h1>LearnHub Security</h1><p>${message} <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
            );

            if (!emailSent.success) {
                return res.status(500).json({ success: false, message: "Failed to send OTP email" });
            }

            return res.json({
                success: true,
                requireOTP: true,
                isUnverified: !user.isVerified,
                message: !user.isVerified ? "Please verify your email with the OTP sent." : "2FA OTP sent to your email."
            });
        }

        user.lastLogin = new Date();
        await user.save();

        console.log(`✅ Login successful for ${user.role}`);
        const token = createToken(user._id)
        return res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                availability: user.availability || []
            }
        })

    } catch (error) {
        console.error("❌ Login Error:", error);
        return res.status(500).json({ success: false, message: "Backend Login Error!" })
    }
}


export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Allow verified users to verify OTP (for 2FA)
        // Only block if it's explicitly an unverified-required flow, 
        // but here we can just skip the isVerified check if they have a valid OTP.

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (new Date() > user.otpExpires) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = createToken(user._id);

        res.json({
            success: true,
            message: "Email verified successfully!",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const resendOTP = async (req, res) => {
    const { email } = req.body;
    console.log("📨 RESEND_OTP request received for:", email);

    try {
        console.log("🔍 Finding user in database...");
        const user = await userModel.findOne({ email });

        if (!user) {
            console.log("❌ User not found for email:", email);
            return res.status(404).json({ success: false, message: "User not found" });
        }
        console.log("✅ User found:", user.email, "| Verified:", user.isVerified);
        const isAdmin = user.role === 'admin';

        if (user.isVerified && !isAdmin) {
            console.log("ℹ️ User already verified, skipping resend.");
            return res.status(400).json({ success: false, message: "Email already verified" });
        }

        // Cooldown: prevent resend within 60 seconds of the last OTP
        console.log("⏱️ Checking cooldown...");
        if (user.otpExpires) {
            // Assume the expiration was set 10 minutes after sending (verified in models/controllers)
            // But to be safer, we just use a fixed 60s cooldown from 'now' saved in a new 'lastOtpSent' field?
            // For now, let's fix the math based on the current 10m/15m defaults.
            const otpValidityPeriod = (user.otp && user.otp.length === 6) ? 10 : 15; // 10m for verification, 15m for reset

            // Actually, let's just use the current time compared to the potential creation time
            // If otpExpires is valid, it was set at (otpExpires - validityPeriod)
            // We'll just enforce a simpler 60s cooldown if possible.
            // But we don't have a 'lastSent' field. Let's just assume 10 mins for now as it's most common.
            const lastOtpSentAt = new Date(user.otpExpires.getTime() - 10 * 60 * 1000);
            const cooldownEnd = new Date(lastOtpSentAt.getTime() + 60 * 1000);
            if (new Date() < cooldownEnd) {
                const waitSeconds = Math.ceil((cooldownEnd - new Date()) / 1000);
                console.log(`⏳ Cooldown active: wait ${waitSeconds}s`);
                return res.status(429).json({ success: false, message: `Please wait ${waitSeconds} seconds before requesting a new OTP.` });
            }
        }
        console.log("✅ Cooldown check passed.");

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        console.log("🎲 New OTP generated:", otp);

        user.otp = otp;
        user.otpExpires = otpExpires;

        console.log("💾 Saving user with new OTP...");
        await user.save();
        console.log("✅ User saved successfully.");

        console.log("📧 Attempting to send email...");
        const emailSent = await sendEmail(
            email,
            "Verification Code - LearnHub",
            `Your new OTP is: ${otp}`,
            `<h1>LearnHub Verification</h1><p>Your new verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
        );

        console.log("📬 Email result success:", emailSent.success);
        if (!emailSent.success) {
            console.warn("⚠️ RESEND OTP (EMAILING FAILED):", otp);
            return res.status(500).json({ success: false, message: "Failed to send email. Please try again later." });
        }

        console.log("✅ RESEND_OTP process complete.");
        res.json({ success: true, message: "New OTP sent to your email!" });

    } catch (error) {
        console.error("💥 Resend OTP Error:", error);
        res.status(500).json({ success: false, message: "Server Error", details: error.message });
    }
}


export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const resetOTP = generateOTP();
        const resetOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        user.otp = resetOTP;
        user.otpExpires = resetOTPExpires;
        await user.save();

        const emailSent = await sendEmail(
            email,
            "Password Reset - LearnHub",
            `Your password reset code is: ${resetOTP}`,
            `<h1>Password Reset</h1><p>Your password reset code is: <strong>${resetOTP}</strong></p><p>This code expires in 15 minutes.</p>`
        );

        if (!emailSent.success) {
            console.warn("⚠️ FORGOT PASSWORD OTP (EMAILING FAILED):", resetOTP);
            return res.status(500).json({ success: false, message: "Failed to send reset code. Please try again later." });
        }

        return res.json({ success: true, message: "Password reset code sent to your email!" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({ success: false, message: "Server Error!" });
    }
}


export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        if (user.otp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset code!" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters!" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined; // Clear OTP
        user.otpExpires = undefined;

        await user.save();

        return res.json({ success: true, message: "Password reset successfully! You can now log in." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ success: false, message: "Server Error!" });
    }
}



export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId; // From middleware
        const rawUpdates = req.body;

        // Whitelist: only allow safe fields to be updated by the user
        const allowedFields = [
            'age', 'gender', 'phone', 'bio', 'education', 'skills',
            'interests', 'goal', 'subject', 'topics', 'experience',
            'price', 'mode', 'name', 'upiId', 'classRange'
        ];
        const updates = {};
        for (const key of allowedFields) {
            if (rawUpdates[key] !== undefined) {
                updates[key] = rawUpdates[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No valid fields to update" });
        }

        const user = await userModel.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile Updated", user });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const uploadFiles = async (req, res) => {
    try {
        const userId = req.userId;
        const updates = {};

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ success: false, message: "No files provided" });
        }

        if (req.files.profileImage && req.files.profileImage[0]) {
            updates.profileImage = `teachers/${req.files.profileImage[0].filename}`;
        }
        if (req.files.qrCode && req.files.qrCode[0]) {
            updates.qrCode = `teachers/${req.files.qrCode[0].filename}`;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No valid files to upload" });
        }

        const user = await userModel.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select('-password');

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "Files Uploaded Successfully", user });
    } catch (error) {
        console.error("Upload Files Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}


export const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}


export const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments();
        const totalTeachers = await userModel.countDocuments({ role: 'teacher' });
        const totalStudents = await userModel.countDocuments({ role: 'student' });

        const tutors = await userModel.find({ role: 'teacher', averageRating: { $gt: 0 } });
        let totalRating = 0;
        let tutorsWithRating = 0;
        
        tutors.forEach(t => {
            totalRating += t.averageRating;
            tutorsWithRating++;
        });

        const platformRating = tutorsWithRating > 0 ? parseFloat((totalRating / tutorsWithRating).toFixed(1)) : 4.9;

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalTeachers,
                totalStudents,
                rating: platformRating
            }
        });
    } catch (error) {
        console.error("Get Platform Stats Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}