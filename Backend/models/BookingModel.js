import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    timeSlot: {
        type: String,
        required: true // e.g., "7:00 PM"
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Under Review', 'Paid', 'Failed'],
        default: 'Pending'
    },
    transactionId: {
        type: String
    },
    paymentScreenshot: {
        type: String
    },
    zoomLink: {
        type: String
    },
    meetingId: {
        type: String
    },
    passcode: {
        type: String
    },
    ratingToTeacher: {
        type: Number,
        min: 1,
        max: 5
    },
    commentToTeacher: {
        type: String
    },
    ratingToStudent: {
        type: Number,
        min: 1,
        max: 5
    },
    commentToStudent: {
        type: String
    }
}, { timestamps: true });

const BookingModel = mongoose.models.booking || mongoose.model('booking', bookingSchema);
export default BookingModel;
