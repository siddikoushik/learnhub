import express from 'express';
import Booking from '../models/BookingModel.js';
import User from '../models/UserModel.js';
import PaymentModel from '../models/PaymentModel.js';
import upload from '../middleware/multer.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Separate multer config for screenshots
const screenshotDir = path.join(process.cwd(), 'uploads/screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}
const screenshotStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, screenshotDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const screenshotUpload = multer({ storage: screenshotStorage });

const router = express.Router();

// --- PRIORITY ROUTES (Defined FIRST to prevent 404s) ---

// PUT /api/booking/:id/zoom -> Update Zoom details
router.put('/:id/zoom', AuthMiddleware, async (req, res) => {
    console.log(`📡 ZOOM UPDATE REQUEST: Booking ID ${req.params.id}`);
    try {
        const { zoomLink, meetingId, passcode } = req.body;
        console.log(`🔗 Link Data:`, { zoomLink, meetingId, passcode });

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { zoomLink, meetingId, passcode },
            { new: true }
        );

        if (!booking) {
            console.log("❌ Booking not found in database for ID:", req.params.id);
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        console.log("✅ Zoom details updated successfully!");
        res.json({ success: true, message: "Zoom details updated!", booking });
    } catch (error) {
        console.error("Error updating zoom details:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PUT /api/booking/:id/rate-teacher -> Student rates teacher
router.put('/:id/rate-teacher', AuthMiddleware, async (req, res) => {
    console.log(`⭐ RATING TEACHER: Booking ID ${req.params.id}`);
    try {
        const { rating, comment } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            console.log("❌ Booking not found for rating");
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        if (booking.studentId.toString() !== req.userId) {
            console.log("❌ Unauthorized rating attempt");
            return res.status(403).json({ success: false, message: "Unauthorized to rate this teacher" });
        }

        booking.ratingToTeacher = rating;
        booking.commentToTeacher = comment;
        await booking.save();

        // Calculate Average Rating for Teacher
        const teacherBookings = await Booking.find({ teacherId: booking.teacherId, ratingToTeacher: { $ne: null } });
        let tSum = 0;
        let tCount = 0;
        teacherBookings.forEach(b => {
            if (b.ratingToTeacher) {
                tSum += b.ratingToTeacher;
                tCount++;
            }
        });
        const tAvg = tCount > 0 ? parseFloat((tSum / tCount).toFixed(1)) : 0;
        await User.findByIdAndUpdate(booking.teacherId, { averageRating: tAvg, totalRatings: tCount });

        console.log("✅ Rating submitted successfully");
        res.json({ success: true, message: "Rating submitted!", booking });
    } catch (error) {
        console.error("Error rating teacher:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PUT /api/booking/:id/rate-student -> Teacher rates student
router.put('/:id/rate-student', AuthMiddleware, async (req, res) => {
    console.log(`⭐ RATING STUDENT: Booking ID ${req.params.id}`);
    try {
        const { rating, comment } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            console.log("❌ Booking not found for rating");
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        if (booking.teacherId.toString() !== req.userId) {
            console.log("❌ Unauthorized rating attempt");
            return res.status(403).json({ success: false, message: "Unauthorized to rate this student" });
        }

        booking.ratingToStudent = rating;
        booking.commentToStudent = comment;
        await booking.save();

        // Calculate Average Rating for Student
        const studentBookings = await Booking.find({ studentId: booking.studentId, ratingToStudent: { $ne: null } });
        let sSum = 0;
        let sCount = 0;
        studentBookings.forEach(b => {
            if (b.ratingToStudent) {
                sSum += b.ratingToStudent;
                sCount++;
            }
        });
        const sAvg = sCount > 0 ? parseFloat((sSum / sCount).toFixed(1)) : 0;
        await User.findByIdAndUpdate(booking.studentId, { averageRating: sAvg, totalRatings: sCount });

        console.log("✅ Rating submitted successfully");
        res.json({ success: true, message: "Rating submitted!", booking });
    } catch (error) {
        console.error("Error rating student:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// POST /api/booking/:id/upload-screenshot -> Upload payment proof
router.post('/:id/upload-screenshot', AuthMiddleware, screenshotUpload.single('screenshot'), async (req, res) => {
    console.log(`📸 SCREENSHOT UPLOAD: Booking ID ${req.params.id}`);
    try {
        const screenshot = req.file?.filename;
        if (!screenshot) {
            console.log("❌ No file received in request");
            return res.status(400).json({ success: false, message: "No screenshot provided" });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
            paymentScreenshot: `screenshots/${screenshot}`,
                paymentStatus: 'Under Review'
            },
            { new: true }
        );

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        console.log("✅ Screenshot saved and status updated to 'Under Review'");
        res.json({ success: true, message: "Screenshot uploaded! Waiting for approval.", booking });
    } catch (error) {
        console.error("Error uploading screenshot:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/booking/test -> Verify routes are live
router.get('/test', (req, res) => {
    res.json({ success: true, message: "Booking Routes are LIVE! (v2)" });
});

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
router.post('/', AuthMiddleware, async (req, res) => {
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
router.get('/student/:studentId', AuthMiddleware, async (req, res) => {
    try {
        const { studentId } = req.params;
        console.log(`🔍 Fetching bookings for Student ID: ${studentId}`);
        const bookings = await Booking.find({ studentId })
            .populate('teacherId', 'name subject qrCode profileImage price') // Get teacher details
            .sort({ createdAt: -1 }); // Newest first

        const processedBookings = bookings.map(booking => {
            const b = booking.toObject();
            const bothRated = b.ratingToTeacher && b.ratingToStudent;
            
            // Flags for UI status
            b.hasRatedTeacher = !!b.ratingToTeacher;
            b.hasRatedStudent = !!b.ratingToStudent;

            if (!bothRated) {
                b.ratingToTeacher = null;
                b.commentToTeacher = null;
                b.ratingToStudent = null;
                b.commentToStudent = null;
            }
            return b;
        });

        console.log(`✅ Found ${bookings.length} bookings for student.`);
        res.json({ success: true, bookings: processedBookings });
    } catch (error) {
        console.error("Error fetching student bookings:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/booking/teacher/:teacherId -> Get bookings for a teacher
router.get('/teacher/:teacherId', AuthMiddleware, async (req, res) => {
    try {
        const { teacherId } = req.params;
        const bookings = await Booking.find({ teacherId })
            .populate('studentId', 'name email') // Get student details
            .populate('teacherId', 'name subject') // Get teacher subject
            .sort({ createdAt: -1 }); // Newest first

        const processedBookings = bookings.map(booking => {
            const b = booking.toObject();
            const bothRated = b.ratingToTeacher && b.ratingToStudent;

            // Flags for UI status
            b.hasRatedTeacher = !!b.ratingToTeacher;
            b.hasRatedStudent = !!b.ratingToStudent;

            if (!bothRated) {
                b.ratingToTeacher = null;
                b.commentToTeacher = null;
                b.ratingToStudent = null;
                b.commentToStudent = null;
            }
            return b;
        });

        res.json({ success: true, bookings: processedBookings });
    } catch (error) {
        console.error("Error fetching teacher bookings:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// DELETE /api/booking/:id -> Cancel a booking
router.delete('/:id', AuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Cancellation request for Booking ID: ${id}`);
        const booking = await Booking.findById(id);

        if (!booking) {
            console.log(`❌ Booking ${id} not found in database.`);
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // 1. Free up the slot in Teacher's availability
        await User.updateOne(
            { _id: booking.teacherId, "availability.time": booking.timeSlot },
            { $set: { "availability.$.isBooked": false } }
        );

        // 2. Delete the booking
        await Booking.findByIdAndDelete(id);

        res.json({ success: true, message: "Booking Deleted" });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// --- SCREENSHOT UPLOAD REMOVED FROM HERE (MOVED TO TOP) ---

// --- GENERIC GET % DELETE ---

// GET /api/booking/:id -> Get single booking details
router.get('/:id', AuthMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('studentId', 'name email')
            .populate('teacherId', 'name subject');

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const b = booking.toObject();
        const bothRated = b.ratingToTeacher && b.ratingToStudent;

        // Flags for UI status
        b.hasRatedTeacher = !!b.ratingToTeacher;
        b.hasRatedStudent = !!b.ratingToStudent;

        if (!bothRated) {
            b.ratingToTeacher = null;
            b.commentToTeacher = null;
            b.ratingToStudent = null;
            b.commentToStudent = null;
        }

        res.json({ success: true, booking: b });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PUT /api/booking/:id/approve-payment -> Teacher approves student
router.put('/:id/approve-payment', AuthMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                paymentStatus: 'Paid',
                status: 'Confirmed'
            },
            { new: true }
        );

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
        
        // Also update Payment record if exists
        await PaymentModel.findOneAndUpdate({ bookingId: req.params.id }, { status: 'verified' });

        res.json({ success: true, message: "Payment Approved! Student can now join the class.", booking });
    } catch (error) {
        console.error("Error approving payment:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PUT /api/booking/:id/reject-payment -> Teacher rejects student
router.put('/:id/reject-payment', AuthMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                paymentStatus: 'Failed',
                status: 'Pending' // Or keep as is
            },
            { new: true }
        );

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        // Also update Payment record if exists
        await PaymentModel.findOneAndUpdate({ bookingId: req.params.id }, { status: 'rejected' });

        res.json({ success: true, message: "Payment Rejected.", booking });
    } catch (error) {
        console.error("Error rejecting payment:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


export default router;
