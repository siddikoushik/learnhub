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
  const { time, action, subject, price, classRange } = req.body;
  console.log("🔹 AVAILABILITY UPDATE:", { userId, action, time, subject, price, classRange });

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update Subject, Price, Class Range if provided
    if (subject) user.subject = subject;
    if (price) user.price = price;
    if (classRange) user.classRange = classRange;

    if (action === 'add') {
      const timesToAdd = Array.isArray(time) ? time : [time];
      let addedCount = 0;
      let skippedCount = 0;

      timesToAdd.forEach(t => {
        const exists = user.availability.find(slot => slot.time === t);
        if (!exists) {
          user.availability.push({ time: t, isBooked: false });
          addedCount++;
        } else {
          skippedCount++;
        }
      });

      await user.save();
      return res.json({ 
        success: true, 
        message: addedCount > 0 ? `Added ${addedCount} slots. ${skippedCount > 0 ? `Skipped ${skippedCount} duplicates.` : ""}` : "All slots already exist.", 
        availability: user.availability 
      });

    } else if (action === 'remove') {
      user.availability = user.availability.filter(slot => slot.time !== time);
    } else if (action === 'clear_all') {
      user.availability = [];
    }

    await user.save();
    res.json({ success: true, message: "Availability updated", availability: user.availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
