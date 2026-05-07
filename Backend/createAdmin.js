import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import userModel from './models/UserModel.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONG_URI);
        console.log("Connected to MongoDB");

        const adminEmail = "admin@learnhub.com";
        const adminPassword = "adminpassword123";

        const existingAdmin = await userModel.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("Admin already exists!");
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const admin = new userModel({
            name: "Master Admin",
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            isActive: true
        });

        await admin.save();
        console.log("✅ Admin account created successfully!");
        console.log("Email: " + adminEmail);
        console.log("Password: " + adminPassword);

        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
