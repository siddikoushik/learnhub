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
        enum: ['Confirmed', 'Completed', 'Cancelled'],
        default: 'Confirmed'
    }
}, { timestamps: true });

const BookingModel = mongoose.models.booking || mongoose.model('booking', bookingSchema);
export default BookingModel;
