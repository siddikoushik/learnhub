import mongoose from "mongoose";
import dotenv from 'dotenv'

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONG_URI;
        if (!uri) {
            throw new Error("❌ MONGO_URI (or MONG_URI) is missing in environment variables");
        }

        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

dotenv.config();

export default connectDB;