import TeacherProfile from "../models/TeacherProfile.js";
import UserModel from "../models/UserModel.js"; // Needed for availability
import { generateTeacherProfile } from "../utils/generateTeacherProfile.js";

// Create Teacher Profile (Legacy - Registration handles this now in UserController)
export const createTeacherProfile = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Please use the Signup page to register as a teacher."
  });
};

// Get All Teachers
export const getAllTeachers = async (req, res) => {
  try {
    // Queries the main User Collection where role is 'teacher'
    const teachers = await UserModel.find({ role: "teacher" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch teachers" });
  }
};

// Get Teacher By ID
export const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find in User collection
    const teacher = await UserModel.findById(id).select("-password");

    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch teacher details" });
  }
};

// Manage Availability (Add/Remove Slots - Updates USER model)
export const manageAvailability = async (req, res) => {
  const userId = req.userId; // From Auth Middleware (Secure)
  const { time, action, subject } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update Subject text if provided
    if (subject) user.subject = subject;

    if (action === 'add') {
      // Handle Array of Times (Bulk Add) or Single String
      const timesToAdd = Array.isArray(time) ? time : [time];

      timesToAdd.forEach(t => {
        // Prevent duplicates
        const exists = user.availability.find(slot => slot.time === t);
        if (!exists) {
          user.availability.push({ time: t, isBooked: false });
        }
      });

    } else if (action === 'remove') {
      // Remove specific slot
      user.availability = user.availability.filter(slot => slot.time !== time);
    }

    await user.save();
    res.json({ success: true, message: "Availability updated", availability: user.availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
