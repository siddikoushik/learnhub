import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import validator from 'validator'
import userModel from '../models/UserModel.js';

dotenv.config();

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
}

export const register = async (req, res) => {
    const { name, email, password, role } = req.body; // Added role
    console.log("🔹 Register attempt:", { name, email, role }); // Log input (hide password)

    try {
        if (!name || !email || !password) {
            console.log("❌ Missing fields");
            return res.status(400).json({ success: false, message: "Please enter all the fields!" })
        }
        if (!validator.isEmail(email)) {
            console.log("❌ Invalid email format");
            return res.status(400).json({ success: false, message: "Please enter Valid Email!" })
        }
        if (password.length < 6) {
            console.log("❌ Password too short");
            return res.status(400).json({ success: false, message: "Password must be more than 6 characters!" })
        }
        const exist = await userModel.findOne({ email });
        if (exist) {
            console.log("❌ User already exists");
            return res.status(400).json({ success: false, message: "User already exists!" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await new userModel({
            name,
            email,
            password: hashedPassword,
            role: role || 'student' // Save role
        })
        await newUser.save()
        const token = createToken(newUser._id);
        console.log(`✅ User registered: ${email} as ${role || 'student'}`);
        return res.json({ success: true, token })

    } catch (error) {
        console.error("❌ Register Error:", error);
        return res.status(500).json({ success: false, message: "Backend Resgister Error!" })
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



export default { register, login }