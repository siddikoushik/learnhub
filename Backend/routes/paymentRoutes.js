import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/BookingModel.js';
import User from '../models/UserModel.js';
import PaymentModel from '../models/PaymentModel.js';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';

dotenv.config();

const router = express.Router();

// Initialize Razorpay only if real keys are configured
let razorpay = null;
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (keyId && keySecret && !keyId.includes('placeholder')) {
    razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    console.log("✅ Razorpay initialized");
} else {
    console.warn("⚠️ Razorpay keys not configured — payment routes will return errors");
}

// Create an order
router.post('/create-order', async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({ success: false, message: "Payment service not configured. Please contact support." });
    }

    try {
        const { amount, bookingId } = req.body;

        if (!amount || !bookingId) {
            return res.status(400).json({ success: false, message: "Amount and bookingId are required" });
        }

        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise for INR)
            currency: "INR",
            receipt: `receipt_${bookingId}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) return res.status(500).json({ success: false, message: "Failed to create order" });

        res.json({ success: true, order });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({ success: false, message: "Payment service not configured." });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
            return res.status(400).json({ success: false, message: "Missing payment verification fields" });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update Booking status
            await Booking.findByIdAndUpdate(bookingId, {
                status: 'Confirmed',
                paymentStatus: 'Paid',
                transactionId: razorpay_payment_id
            });

            res.json({ success: true, message: "Payment Verified Successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


// --- QR PAYMENT ROUTES ---

// Multer config for screenshot upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// 1. Create a payment request
router.post('/create-payment', async (req, res) => {
    try {
        const { studentId, teacherId, amount, bookingId } = req.body;
        if (!studentId || !teacherId || !amount) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const paymentRef = 'LH' + Date.now() + Math.floor(Math.random() * 1000);

        const newPayment = new PaymentModel({
            studentId,
            teacherId,
            bookingId,
            amount,
            paymentRef,
            status: 'pending'
        });

        await newPayment.save();

        res.json({ success: true, payment: newPayment });
    } catch (error) {
        console.error("Error creating QR payment:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// 2. Upload proof
router.post('/upload-proof', upload.single('screenshot'), async (req, res) => {
    try {
        const { paymentId, transactionId } = req.body;
        
        if (!paymentId) {
            return res.status(400).json({ success: false, message: "Payment ID required" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Screenshot required" });
        }

        const screenshotUrl = req.file.filename;

        // 1. Update Payment Record
        const payment = await PaymentModel.findByIdAndUpdate(paymentId, {
            screenshotUrl,
            transactionId: transactionId || '',
            status: 'pending' // keep as pending until teacher verifies
        }, { new: true });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }

        // 2. Sync with Booking Record
        // If payment has bookingId, use it directly. Otherwise, find the most recent matching booking.
        let bookingUpdateResult;
        if (payment.bookingId) {
            bookingUpdateResult = await Booking.findByIdAndUpdate(payment.bookingId, {
                paymentScreenshot: screenshotUrl,
                transactionId: transactionId || '',
                paymentStatus: 'Under Review'
            });
        } else {
            // Fallback: find the latest unpaid booking for this student-teacher pair
            bookingUpdateResult = await Booking.findOneAndUpdate(
                {
                    studentId: payment.studentId,
                    teacherId: payment.teacherId,
                    paymentStatus: { $in: ['Pending', 'Under Review', null] }
                },
                {
                    paymentScreenshot: screenshotUrl,
                    transactionId: transactionId || '',
                    paymentStatus: 'Under Review'
                },
                { sort: { createdAt: -1 }, new: true }
            );

            // Also backfill bookingId on the payment record
            if (bookingUpdateResult) {
                await PaymentModel.findByIdAndUpdate(paymentId, { bookingId: bookingUpdateResult._id });
            }
        }

        console.log(`✅ Upload proof: Payment ${paymentId} updated. Booking synced: ${!!bookingUpdateResult}`);
        res.json({ success: true, payment });
    } catch (error) {
        console.error("Error uploading proof:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// 3. Get payment status
router.get('/payment-status/:id', async (req, res) => {
    try {
        const payment = await PaymentModel.findById(req.params.id);
        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

        res.json({ success: true, payment });
    } catch (error) {
        console.error("Error getting payment status:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// 4. Verify payment (Teacher/Admin)
router.post('/verify-payment', async (req, res) => {
    try {
        const { paymentId, status } = req.body; // status: 'verified' or 'rejected'
        
        if (!paymentId || !status) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const payment = await PaymentModel.findByIdAndUpdate(paymentId, { status }, { new: true });
        
        if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

        if (status === 'verified') {
            // Update the existing booking
            let bookingUpdateResult;
            if (payment.bookingId) {
                bookingUpdateResult = await Booking.findByIdAndUpdate(payment.bookingId, {
                    paymentStatus: 'Paid',
                    status: 'Confirmed',
                    transactionId: payment.transactionId || payment.paymentRef,
                    paymentScreenshot: payment.screenshotUrl
                }, { new: true });
            } else {
                // Fallback: find the latest pending booking
                bookingUpdateResult = await Booking.findOneAndUpdate(
                    {
                        studentId: payment.studentId,
                        teacherId: payment.teacherId,
                        paymentStatus: { $in: ['Pending', 'Under Review', null] }
                    },
                    {
                        paymentStatus: 'Paid',
                        status: 'Confirmed',
                        transactionId: payment.transactionId || payment.paymentRef,
                        paymentScreenshot: payment.screenshotUrl
                    },
                    { sort: { createdAt: -1 }, new: true }
                );
            }
            console.log(`✅ Admin/Teacher Verify: Payment ${paymentId} verified. Booking updated: ${!!bookingUpdateResult}`);
        } else if (status === 'rejected') {
            // Update booking to Failed/Pending
            if (payment.bookingId) {
                await Booking.findByIdAndUpdate(payment.bookingId, {
                    paymentStatus: 'Failed',
                    status: 'Pending'
                });
            }
        }

        res.json({ success: true, payment });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// 5. Get pending payments (Admin/Teacher panel)
router.get('/pending-payments', async (req, res) => {
    try {
        const payments = await PaymentModel.find({ status: 'pending' })
            .populate('studentId', 'name email')
            .populate('teacherId', 'name email');
        res.json({ success: true, payments });
    } catch (error) {
        console.error("Error fetching pending payments:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

export default router;
