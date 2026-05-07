import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
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
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'booking'
    },
    amount: {
        type: Number,
        required: true
    },
    paymentRef: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    screenshotUrl: {
        type: String
    },
    transactionId: {
        type: String
    }
}, { timestamps: true });

const PaymentModel = mongoose.models.payment || mongoose.model('payment', paymentSchema);
export default PaymentModel;
