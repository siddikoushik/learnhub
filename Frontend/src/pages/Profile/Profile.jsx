import React, { useContext, useState } from 'react';
import './Profile.css';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, isAuthenticated, token, url, setUser } = useContext(AuthContext); // Get token & url
    const navigate = useNavigate();

    // Safety check: specific case where auth is true but user object is not yet populated
    if (isAuthenticated && !user) {
        return <div className="loading-container">Loading Profile...</div>;
    }

    // File Input Refs
    const photoRef = React.useRef(null);
    const qrRef = React.useRef(null);
    const docRef = React.useRef(null);

    // Combined state for all fields (init with user data)
    const [formData, setFormData] = useState({
        age: user?.age || '',
        gender: user?.gender || 'Select',
        subject: user?.subject || '',
        topics: user?.topics || '', // Assuming topics exists or mapped to bio/skills
        phone: user?.phone || '',
        bio: user?.bio || '',
        experience: user?.experience || '',
        price: user?.price || '',
        mode: user?.mode || 'Online',
        education: user?.education || '',
        classRange: user?.classRange || '',
        upiId: user?.upiId || ''
    });

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
                <h2>Please Login to View Profile</h2>
            </div>
        );
    }

    const isTeacher = user?.role === 'teacher';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileClick = (ref) => {
        ref.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fieldName = e.target.name; // Use name attribute to distinguish
        const formData = new FormData();
        formData.append(fieldName, file);

        try {
            const response = await fetch(`${url}/api/user/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                alert(`${fieldName} Uploaded Successfully!`);
                setUser(data.user); // Update context
            } else {
                alert("Upload failed: " + data.message);
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Error uploading file");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Need axios here (ensure it's imported or available globally, or use fetch)
            // Using fetch for simplicity as axios might need import at top
            const response = await fetch(`${url}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert("Profile Updated Successfully!");
                // Optionally update context user to reflect changes immediately
                // setUser(data.user); // If setUser is exposed
            } else {
                alert("Failed: " + data.message);
            }
        } catch (error) {
            console.error("Profile Save Error:", error);
            alert("Error saving profile");
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">

                {/* TOP: Header & Photo */}
                <div className="profile-header">
                    <div className="profile-photo-wrapper" onClick={() => handleFileClick(photoRef)} style={{ cursor: 'pointer' }}>
                        <input type="file" hidden ref={photoRef} name="profileImage" onChange={handleFileChange} accept="image/*" />
                        {user.profileImage ? (
                            <img src={`${url}/images/${user.profileImage}`} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <span role="img" aria-label="avatar">👤</span>
                        )}
                        <div className="upload-overlay">Change</div>
                    </div>
                    <h1 className="profile-name">{user.name}</h1>
                    <span className="profile-role-badge">{user.role}</span>
                </div>

                <div className="profile-form-section">
                    <form onSubmit={handleSave}>

                        {/* SHARED FIELDS */}
                        <div className="section-label">Basic Information</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={user.name}
                                    readOnly // Name usually verified
                                />
                            </div>

                            <div className="form-group">
                                <label>Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    className="form-control"
                                    placeholder="Enter Age"
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    className="form-control"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option>Select</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    defaultValue={user.email}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* CONDITIONAL SECTIONS */}
                        {isTeacher ? (
                            <>
                                <div className="section-label">Teaching Details</div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Main Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            className="form-control"
                                            placeholder="e.g. Mathematics"
                                            value={formData.subject}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Class Range</label>
                                        <input
                                            type="text"
                                            name="classRange"
                                            className="form-control"
                                            placeholder="e.g. Class 5 - 10"
                                            value={formData.classRange}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Hourly Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            className="form-control"
                                            placeholder="e.g. 500"
                                            value={formData.price}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Teaching Mode</label>
                                        <select
                                            name="mode"
                                            className="form-control"
                                            value={formData.mode}
                                            onChange={handleChange}
                                        >
                                            <option>Online</option>
                                            <option>Offline</option>
                                            <option>Both</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="section-label">Professional Details (Teacher)</div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Education / Qualification</label>
                                        <input
                                            type="text"
                                            name="education"
                                            className="form-control"
                                            placeholder="e.g. B.Tech, M.Sc"
                                            value={formData.education}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Teaching Experience (Years)</label>
                                        <input
                                            type="number"
                                            name="experience"
                                            className="form-control"
                                            placeholder="e.g. 5"
                                            value={formData.experience}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Bio / About Me</label>
                                        <textarea
                                            name="bio"
                                            className="form-control"
                                            placeholder="Write a short bio about yourself..."
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows="4"
                                            style={{ resize: 'vertical' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Well Known Topics</label>
                                        <input
                                            type="text"
                                            name="topics"
                                            className="form-control"
                                            placeholder="e.g. Algebra, Calculus"
                                            value={formData.topics}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="section-label">Verification & Payment</div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Payment UPI ID / Number</label>
                                        <input
                                            type="text"
                                            name="upiId"
                                            className="form-control"
                                            placeholder="e.g. teacher@upi or 9876543210"
                                            value={formData.upiId}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Payment QR Code Photo</label>
                                        <input type="file" hidden ref={qrRef} name="qrCode" onChange={handleFileChange} accept="image/*" />
                                        <div className="file-input-wrapper" onClick={() => handleFileClick(qrRef)}>
                                            <p>Click to {user.qrCode ? 'Update' : 'Upload'} QR Code</p>
                                        </div>
                                        {/* QR Preview */}
                                        {user.qrCode && (
                                            <div className="qr-preview-container" style={{ marginTop: '10px' }}>
                                                <img src={`${url}/images/${user.qrCode}`} alt="QR Code" style={{ maxWidth: '150px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Verification Documents</label>
                                        <input type="file" hidden ref={docRef} onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg" />
                                        <div className="file-input-wrapper" onClick={() => handleFileClick(docRef)}>
                                            <p>Upload Degree / Certificates</p>
                                        </div>
                                        <small>Required to get "Verified" badge.</small>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // STUDENT VIEW
                            <>
                                <div className="section-label">Verification</div>

                                <div className="form-group">
                                    <label>Email Verification</label>
                                    <div className="verification-group">
                                        <input type="text" className="form-control" value="Verified ✅" readOnly disabled style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <div className="verification-group">
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-control"
                                            placeholder="+1 234 567 8900"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                        <button type="button" className="verify-btn">Verify</button>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                            <button type="submit" className="btn-primary">Save Profile</button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
