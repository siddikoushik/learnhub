import TeacherProfile from "../models/TeacherProfile.js";
import UserModel from "../models/UserModel.js"; // Needed for availability
import { generateTeacherProfile } from "../utils/generateTeacherProfile.js";

// Create Teacher Profile
export const createTeacherProfile = async (req, res) => {
  try {
    const imagePath = req.file ? `teachers/${req.file.filename}` : "";

    const teacher = await TeacherProfile.create({
      name: req.body.name,
      email: req.body.email,
      qualification: req.body.qualification,
      subjects: req.body["subjects[]"],
      experience: req.body.experience,
      bio: req.body.bio,
      price: req.body.price,
      mode: req.body.mode,
      image: imagePath,
    });

    res.status(201).json({
      success: true,
      message: "Teacher profile created successfully",
      teacher,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create teacher profile" });
  }
};

// Get All Teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await TeacherProfile.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch teachers" });
  }
};

// Get Teacher By ID
export const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await TeacherProfile.findById(id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // Optional description gen
    // const description = await generateTeacherProfile(teacher);

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
      // Prevent duplicates
      const exists = user.availability.find(slot => slot.time === time);
      if (!exists) {
        user.availability.push({ time, isBooked: false });
      }
    } else if (action === 'remove') {
      user.availability = user.availability.filter(slot => slot.time !== time);
    }

    await user.save();
    res.json({ success: true, message: "Availability updated", availability: user.availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
