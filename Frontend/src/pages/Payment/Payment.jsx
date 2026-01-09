import React from "react";
import "./Payment.css";
import { useNavigate } from "react-router-dom";

const Payment = () => {
    const navigate = useNavigate();

    const handlePayment = () => {
        // Simulate API call
        setTimeout(() => {
            alert("Payment Successful! Your slot has been booked.");
            navigate("/studentsmenu/dashboard");
        }, 1000);
    };

    return (
        <div className="payment-container">
            <div className="payment-card">
                <div className="payment-header">
                    <h2>Complete Your Booking 🔒</h2>
                    <p>Scan the code below to pay directly to the tutor.</p>
                </div>

                <div className="amount-display">
                    $25.00
                </div>

                <div className="qr-container">
                    <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=mockteacher@bank"
                        alt="Teacher QR Code"
                        className="qr-image"
                    />
                </div>

                <p className="payment-instructions">
                    <strong>Pay to:</strong> Dr. Alan Grant<br />
                    <strong>Subject:</strong> Maths M1 (7 PM - 10 PM)
                </p>

                <button className="btn-success" onClick={handlePayment}>
                    ✅ I Have Paid
                </button>
            </div>
        </div>
    );
};

export default Payment;
