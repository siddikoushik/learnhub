import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ShieldCheck, ArrowLeft, Copy, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import './QRPayment.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { url } = useContext(AuthContext);

  const { paymentRef, amount, paymentId, upiId, qrCode, teacherName, phone } = location.state || {};
  
  // UPI Deep Linking
  const upiLink = upiId ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(teacherName || 'Teacher')}&am=${amount}&cu=INR&tn=${encodeURIComponent(paymentRef)}` : null;
  const generatedQr = upiLink ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}` : null;

  useEffect(() => {
    if (!paymentRef) {
      toast.error("No payment details found!");
      navigate("/");
    }
  }, [paymentRef, navigate]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (!paymentRef) return null;

  // Determine what to display
  const hasQr = qrCode || upiId;
  const hasPhone = phone;
  const hasPaymentMethod = hasQr || hasPhone;

  return (
    <div className="qrpay-page">
      <div className="qrpay-content">

        {/* Header */}
        <div className="qrpay-header">
          <button className="qrpay-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="qrpay-title">Secure Payment</h1>
        </div>

        {/* Main Card */}
        <div className="qrpay-card">
          <div className="qrpay-card-bg-icon">
            <ShieldCheck size={120} />
          </div>

          <div className="qrpay-card-inner">

            {/* Amount */}
            <div className="qrpay-amount">
              <p className="qrpay-amount-label">Payable Amount</p>
              <div className="qrpay-amount-value">
                <span className="qrpay-currency">₹</span>
                <span className="qrpay-price">{amount}</span>
              </div>
            </div>

            {/* QR Code / Scanner Section */}
            {hasQr ? (
              <div className="qrpay-qr">
                <div className="qrpay-qr-frame">
                  {qrCode ? (
                    <img 
                      src={`${url}/images/${qrCode}`} 
                      alt="Payment QR" 
                    />
                  ) : (
                    <img 
                      src={generatedQr} 
                      alt="Generated Payment QR" 
                    />
                  )}
                </div>
                <p className="qrpay-qr-hint">
                  <Info size={12} /> Scan using any UPI app (GPay, PhonePe, Paytm)
                </p>
              </div>
            ) : hasPhone ? (
              <div className="qrpay-qr">
                <div className="qrpay-mobile-display">
                  <p className="mobile-label">Pay to Mobile Number</p>
                  <h2 className="mobile-number">{phone}</h2>
                  <button 
                    className="qrpay-copy-btn-large"
                    onClick={() => copyToClipboard(phone, 'Mobile Number')}
                  >
                    <Copy size={18} /> Copy Number
                  </button>
                </div>
                <p className="qrpay-qr-hint">
                  <Info size={12} /> Pay using this mobile number on GPay/PhonePe/Paytm
                </p>
              </div>
            ) : (
              <div className="qrpay-no-info">
                <p>No payment QR or mobile number provided by the tutor.</p>
                <p style={{ marginTop: '5px', fontSize: '11px', opacity: 0.7 }}>Please contact the tutor for payment details.</p>
              </div>
            )}

            {/* Details */}
            <div className="qrpay-details">
              <div className="qrpay-detail-row">
                <div className="qrpay-detail-top">
                  <span className="qrpay-detail-label">Teacher</span>
                  <span className="qrpay-detail-value">{teacherName}</span>
                </div>
              </div>

              <div className="qrpay-detail-row">
                <div className="qrpay-detail-top">
                  <span className="qrpay-detail-label">Payment Note</span>
                  <div className="qrpay-ref-row">
                    <span className="qrpay-ref-code">{paymentRef}</span>
                    <button 
                      className="qrpay-copy-btn"
                      onClick={() => copyToClipboard(paymentRef, 'Payment Note')}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <p className="qrpay-detail-note">
                  *Crucial: Enter this note while paying in your UPI app.
                </p>
              </div>
            </div>

            {/* CTA */}
            <button 
              className={`qrpay-cta-btn ${!hasPaymentMethod ? 'disabled' : ''}`}
              onClick={() => hasPaymentMethod && navigate('/upload-proof', { state: { paymentId, paymentRef } })}
              disabled={!hasPaymentMethod}
              style={!hasPaymentMethod ? { opacity: 0.5, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
            >
              {hasPaymentMethod ? "I've Transferred the Amount" : "Payment Details Missing"}
            </button>
          </div>
        </div>


        {/* Footer */}
        <div className="qrpay-footer">
          <p>
            LearnHub uses secure point-to-point encryption for payment verification. 
            Your screenshot will be manually verified by the teacher within 24 hours.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;
