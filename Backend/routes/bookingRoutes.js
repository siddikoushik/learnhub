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
    console.log(`📝 New Booking Request: Student ${studentId} -> Teacher ${teacherId} @ ${timeSlot}`);

    try {
        // 0. CHECK IF SLOT IS ALREADY BOOKED OR DOES NOT EXIST
        const teacher = await User.findById(teacherId);
        if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

        const slot = teacher.availability.find(s => s.time === timeSlot);
        if (!slot) return res.status(400).json({ success: false, message: "Slot not found" });
        if (slot.isBooked) return res.status(400).json({ success: false, message: "Slot already booked" });

        // 0.5 CHECK IF STUDENT ALREADY HAS A CLASS AT THIS TIME
        const existingBooking = await Booking.findOne({ studentId, timeSlot });
        if (existingBooking) {
            return res.status(400).json({ success: false, message: `You already have a class scheduled at ${timeSlot}` });
        }

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
        console.log(`🔍 Fetching bookings for Student ID: ${studentId}`);
        const bookings = await Booking.find({ studentId })
            .populate('teacherId', 'name subject') // Get teacher details
            .sort({ createdAt: -1 }); // Newest first

        console.log(`✅ Found ${bookings.length} bookings for student.`);
        res.json({ success: true, bookings });
    } catch (error) {
        console.error("Error fetching student bookings:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/booking/teacher/:teacherId -> Get bookings for a teacher
router.get('/teacher/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const bookings = await Booking.find({ teacherId })
            .populate('studentId', 'name email') // Get student details
            .sort({ createdAt: -1 }); // Newest first

        res.json({ success: true, bookings });
    } catch (error) {
        console.error("Error fetching teacher bookings:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/booking/:id -> Get single booking details
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('studentId', 'name email')
            .populate('teacherId', 'name subject');

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        res.json({ success: true, booking });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// DELETE /api/booking/:id -> Cancel a booking
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // 1. Free up the slot in Teacher's availability
        await User.updateOne(
            { _id: booking.teacherId, "availability.time": booking.timeSlot },
            { $set: { "availability.$.isBooked": false } }
        );

        // 2. Delete the booking
        await Booking.findByIdAndDelete(id);

        res.json({ success: true, message: "Booking Cancelled" });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

export default router;
