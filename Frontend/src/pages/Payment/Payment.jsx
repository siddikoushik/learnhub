import React, { useContext, useEffect, useState } from "react";
import "./Payment.css";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { url, user, token } = useContext(AuthContext);

    const { bookingId, amount, tutorName, subject, qrCode } = location.state || {};
    const [screenshot, setScreenshot] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1=scan, 2=upload, 3=done

    useEffect(() => {
        if (!bookingId) {
            alert("No booking details found!");
            navigate("/studentsmenu/dashboard");
        }
    }, [bookingId, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setScreenshot(file);
            setCurrentStep(2);
        }
    };

    const handleRemoveFile = () => {
        setScreenshot(null);
        setCurrentStep(1);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const handleUpload = async () => {
        if (!screenshot) return alert("Please select a screenshot first.");

        setUploading(true);
        const formData = new FormData();
        formData.append("screenshot", screenshot);

        try {
            const res = await axios.post(`${url}/api/booking/${bookingId}/upload-screenshot`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.data.success) {
                setCurrentStep(3);
                setTimeout(() => {
                    alert("Proof uploaded! Please wait for the teacher to verify and approve.");
                    navigate("/studentsmenu/dashboard");
                }, 600);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload screenshot.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="payment-page">
            <div className="payment-card">

                {/* ── Gradient Banner ── */}
                <div className="payment-banner">
                    <div className="banner-content">
                        <div className="banner-icon">🔒</div>
                        <h2>Complete Your Payment</h2>
                        <p>Scan the QR code below and upload your payment proof</p>
                    </div>
                </div>

                {/* ── Card Body ── */}
                <div className="payment-body">

                    {/* Step Indicator */}
                    <div className="payment-steps">
                        <div className={`step ${currentStep >= 2 ? 'completed' : 'active'}`}>
                            <div className="step-number">{currentStep >= 2 ? '✓' : '1'}</div>
                            <span className="step-label">Scan & Pay</span>
                        </div>
                        <div className={`step-connector ${currentStep >= 2 ? 'done' : ''}`} />
                        <div className={`step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'inactive'}`}>
                            <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
                            <span className="step-label">Upload Proof</span>
                        </div>
                        <div className={`step-connector ${currentStep >= 3 ? 'done' : ''}`} />
                        <div className={`step ${currentStep === 3 ? 'completed' : 'inactive'}`}>
                            <div className="step-number">{currentStep === 3 ? '✓' : '3'}</div>
                            <span className="step-label">Verified</span>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="amount-section">
                        <div className="amount-label">Total Amount</div>
                        <div className="amount-value">₹{amount || 0}</div>
                        <div className="amount-detail">
                            Session with <span>{tutorName || "Tutor"}</span>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="qr-section">
                        <div className="qr-header">
                            <div className="qr-header-icon">📱</div>
                            <h4>Pay to <span>{tutorName || "Tutor"}</span></h4>
                        </div>
                        <div className="qr-wrapper">
                            {qrCode ? (
                                <img
                                    src={`${url}/images/${qrCode}`}
                                    alt="Teacher QR Code"
                                    className="qr-image"
                                />
                            ) : (
                                <div className="qr-placeholder">
                                    <div className="placeholder-icon">📷</div>
                                    <div>No QR Code uploaded by teacher yet.<br />Please contact the teacher directly.</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Screenshot */}
                    <div className="upload-section">
                        <div className="upload-label">
                            <span className="label-icon">📤</span>
                            Upload Payment Screenshot
                        </div>
                        <div
                            className={`upload-zone ${dragOver ? 'drag-over' : ''} ${screenshot ? 'has-file' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                const file = e.dataTransfer.files[0];
                                if (file) { setScreenshot(file); setCurrentStep(2); }
                            }}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                id="payment-file-upload"
                            />
                            {!screenshot && (
                                <>
                                    <span className="upload-icon">☁️</span>
                                    <div className="upload-text">
                                        Drag & drop your screenshot here or <strong>browse files</strong>
                                    </div>
                                    <div className="upload-hint">Supports: JPG, PNG, WEBP • Max 5MB</div>
                                </>
                            )}
                            {screenshot && (
                                <>
                                    <span className="upload-icon">✅</span>
                                    <div className="upload-text">
                                        File selected! <strong>Click to change</strong>
                                    </div>
                                </>
                            )}
                        </div>

                        {screenshot && (
                            <div className="file-selected">
                                <div className="file-icon">🖼️</div>
                                <div className="file-info">
                                    <div className="file-name">{screenshot.name}</div>
                                    <div className="file-size">{formatFileSize(screenshot.size)}</div>
                                </div>
                                <button className="file-remove" onClick={handleRemoveFile} title="Remove file">✕</button>
                            </div>
                        )}
                    </div>

                    {/* Subject Info */}
                    <div className="info-bar">
                        <div className="info-icon">📚</div>
                        <div className="info-text">
                            <strong>{subject || "General Session"}</strong> — Tutoring Session
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="payment-actions">
                        <button
                            className="btn-submit primary"
                            onClick={handleUpload}
                            disabled={uploading || !screenshot}
                        >
                            {uploading ? (
                                <>
                                    <div className="spinner" />
                                    Uploading Proof...
                                </>
                            ) : (
                                <>
                                    🚀 Submit Payment Proof
                                </>
                            )}
                        </button>

                        <button
                            className="btn-submit secondary"
                            onClick={() => navigate(-1)}
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    {/* Security */}
                    <div className="security-badge">
                        <span className="lock-icon">🔐</span>
                        Secure & encrypted payment verification
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
