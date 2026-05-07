// One-time script to fix old payment records that have proof but weren't synced to bookings
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PaymentModel from './models/PaymentModel.js';
import BookingModel from './models/BookingModel.js';
import UserModel from './models/UserModel.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function fix() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all payments that have a screenshot but status is still pending
    const payments = await PaymentModel.find({
        screenshotUrl: { $exists: true, $ne: '' },
        status: 'pending'
    });

    console.log(`Found ${payments.length} payments with proof to sync`);

    for (const payment of payments) {
        // Find the matching booking
        let booking;
        if (payment.bookingId) {
            booking = await BookingModel.findById(payment.bookingId);
        }

        if (!booking) {
            // Fallback: find by student + teacher, unpaid
            booking = await BookingModel.findOne({
                studentId: payment.studentId,
                teacherId: payment.teacherId,
                paymentStatus: { $in: ['Pending', 'Under Review', null] }
            }).sort({ createdAt: -1 });
        }

        if (booking) {
            booking.paymentScreenshot = payment.screenshotUrl;
            booking.transactionId = payment.transactionId || '';
            booking.paymentStatus = 'Under Review';
            await booking.save();

            // Backfill bookingId if missing
            if (!payment.bookingId) {
                payment.bookingId = booking._id;
                await payment.save();
            }

            console.log(`✅ Synced Payment ${payment._id} → Booking ${booking._id} (${booking.timeSlot})`);
        } else {
            console.log(`⚠️ No matching booking found for Payment ${payment._id}`);
        }
    }

    console.log('\n--- Recalculating Average Ratings ---');
    
    const users = await UserModel.find({ role: { $in: ['teacher', 'student'] } });
    console.log(`Found ${users.length} users to check ratings`);

    for (const user of users) {
        let sum = 0;
        let count = 0;

        if (user.role === 'teacher') {
            const bookings = await BookingModel.find({ teacherId: user._id, ratingToTeacher: { $exists: true, $ne: null } });
            bookings.forEach(b => {
                sum += b.ratingToTeacher;
                count++;
            });
        } else {
            const bookings = await BookingModel.find({ studentId: user._id, ratingToStudent: { $exists: true, $ne: null } });
            bookings.forEach(b => {
                sum += b.ratingToStudent;
                count++;
            });
        }

        const average = count > 0 ? (sum / count).toFixed(1) : 0;
        
        await UserModel.findByIdAndUpdate(user._id, {
            averageRating: parseFloat(average),
            totalRatings: count
        });

        if (count > 0) {
            console.log(`⭐ Updated ${user.role} ${user.name}: Avg ${average}, Total ${count}`);
        }
    }

    console.log('Done!');
    process.exit(0);
}

fix().catch(err => {
    console.error(err);
    process.exit(1);
});
