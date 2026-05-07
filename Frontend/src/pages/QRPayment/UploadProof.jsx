import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Upload, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react';
import { toast } from 'react-toastify';
import './QRPayment.css';

const UploadProof = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { url } = useContext(AuthContext);

  const { paymentId, paymentRef } = location.state || {};
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      toast.error("No payment session found!");
      navigate("/");
    }
  }, [paymentId, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setScreenshot(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!screenshot) return toast.warning("Please select a payment screenshot.");

    setUploading(true);
    const formData = new FormData();
    formData.append("paymentId", paymentId);
    formData.append("screenshot", screenshot);
    if (transactionId) formData.append("transactionId", transactionId);

    try {
      const res = await axios.post(`${url}/api/payment/upload-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        toast.success("Verification proof submitted successfully!");
        setTimeout(() => navigate("/studentsmenu/dashboard"), 2000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload screenshot. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!paymentId) return null;

  return (
    <div className="upload-proof-page">
      <div className="upload-proof-content">

        {/* Header */}
        <div className="upload-proof-header">
          <h1>Submit Payment Proof</h1>
          <p>
            Reference: <span className="ref-highlight">{paymentRef}</span>
          </p>
        </div>

        {/* Card */}
        <div className="upload-proof-card">

          {/* File Upload */}
          <div style={{ marginBottom: '8px' }}>
            <span className="upload-area-label">Screenshot of Transaction</span>

            {!preview ? (
              <div className="upload-dropzone">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="upload-dropzone-inner">
                  <div className="upload-icon-circle">
                    <Upload size={22} />
                  </div>
                  <p className="upload-dropzone-text">Click to upload or drag and drop</p>
                  <p className="upload-dropzone-hint">PNG, JPG or PDF (MAX. 5MB)</p>
                </div>
              </div>
            ) : (
              <div className="upload-preview-container">
                <img src={preview} alt="Payment screenshot preview" />
                <div className="upload-preview-overlay">
                  <button className="upload-remove-btn" onClick={handleRemove}>
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transaction ID */}
          <div className="upload-input-group">
            <label className="upload-input-label">
              <FileText size={14} /> Transaction ID (Optional)
            </label>
            <input
              type="text"
              className="upload-text-input"
              placeholder="Enter UPI Transaction ID or Ref No."
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>

          {/* Info Alert */}
          <div className="upload-info-alert">
            <AlertCircle size={16} />
            <p>
              Once submitted, our team will verify the payment. Ensure the Reference ID is visible
              in the screenshot for faster approval.
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleUpload}
            disabled={uploading || !screenshot}
            className={`upload-submit-btn ${uploading || !screenshot ? 'disabled' : 'active'}`}
          >
            {uploading ? (
              <>
                <div className="upload-spinner" />
                Uploading...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Confirm Submission
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

export default UploadProof;
