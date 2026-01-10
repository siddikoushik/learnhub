import mongoose from "mongoose";
import dotenv from 'dotenv'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher'],
        default: 'student'
    },
    subject: {
        type: String, // e.g. "Maths", "Physics" (Only for teachers)
        default: ''
    },
    availability: [
        {
            time: { type: String }, // e.g., "7:00 PM"
            isBooked: { type: Boolean, default: false }
        }
    ],
    experience: { type: Number },
    bio: { type: String },
    price: { type: Number },
    mode: { type: String, enum: ["Online", "Offline", "Both"] },

    // Student Specific
    education: { type: String },
    skills: { type: String },
    interests: { type: String },
    goal: { type: String },
    phone: { type: String },
    age: { type: Number },
    gender: { type: String },

    // Files (Images/Docs)
    profileImage: { type: String },
    qrCode: { type: String },
    documents: [{ type: String }],
    isVerified: { type: Boolean, default: false }
})

const userModel = mongoose.models.user || mongoose.model("user", userSchema)

export default userModel