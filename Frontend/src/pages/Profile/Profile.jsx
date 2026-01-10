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
        education: user?.education || ''
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            alert(`Selected file: ${file.name}`);
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
                        <input type="file" hidden ref={photoRef} onChange={handleFileChange} accept="image/*" />
                        <span role="img" aria-label="avatar">👤</span>
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
                                <div className="section-label">Professional Details (Teacher)</div>
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
                                        <label>Payment QR Code Photo</label>
                                        <input type="file" hidden ref={qrRef} onChange={handleFileChange} accept="image/*" />
                                        <div className="file-input-wrapper" onClick={() => handleFileClick(qrRef)}>
                                            <p>Click to Upload QR Code</p>
                                        </div>
                                        {/* Placeholder for QR preview */}
                                        <div className="qr-preview">Items QR</div>
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
