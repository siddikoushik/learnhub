import express from 'express';
import Booking from '../models/BookingModel.js';
import User from '../models/UserModel.js';

const router = express.Router();

// GET /api/booking/tutors -> Get all teachers with their availability
router.get('/tutors', async (req, res) => {
    try {
        const tutors = await User.find({ role: 'teacher' }).select('-password');
        res.json({ success: true, tutors });
    } catch (error) {
        console.error("Error fetching tutors:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// POST /api/booking -> Create a booking
router.post('/', async (req, res) => {
    const { studentId, teacherId, timeSlot } = req.body;

    try {
        // 1. Create Booking
        const newBooking = new Booking({
            studentId,
            teacherId,
            timeSlot
        });
        await newBooking.save();

        // 2. Update Teacher Availability (Mark slot as booked)
        // Find the teacher and the specific slot in their availability array
        await User.updateOne(
            { _id: teacherId, "availability.time": timeSlot },
            { $set: { "availability.$.isBooked": true } }
        );

        res.json({ success: true, message: "Booking Confirmed!", booking: newBooking });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/booking/student/:studentId -> Get bookings for a student
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const bookings = await Booking.find({ studentId })
            .populate('teacherId', 'name subject') // Get teacher details
            .sort({ createdAt: -1 }); // Newest first

        res.json({ success: true, bookings });
    } catch (error) {
        console.error("Error fetching student bookings:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

export default router;
