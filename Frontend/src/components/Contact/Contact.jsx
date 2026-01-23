import React from "react";
import "./Contact.css";
import { motion } from "framer-motion";

const Contact = () => {
    return (
        <div id="contact" className="contact-container container">
            <div className="section-header text-center">
                <h2 className="section-title">Get in Touch</h2>
                <p className="section-subtitle">Have questions? We'd love to hear from you.</p>
            </div>

            <div className="contact-wrapper">
                {/* Contact Info Card */}
                <motion.div
                    className="contact-info-card"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="info-header">
                        <h3>Contact Information</h3>
                        <p>Fill out the form or reach us directly.</p>
                    </div>

                    <div className="info-items">
                        <div className="info-item">
                            <div className="icon-box">📍</div>
                            <div className="info-text">
                                <h4>Location</h4>
                                <p>CVR College Of Engineering,<br />Mangalpalli, Ibrahimapatnam.</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="icon-box">📧</div>
                            <div className="info-text">
                                <h4>Email</h4>
                                <p>siddusiddu5849@gmail.com</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="icon-box">📞</div>
                            <div className="info-text">
                                <h4>Phone</h4>
                                <p>+91 9063408229</p>
                            </div>
                        </div>
                    </div>

                    <div className="social-links">
                        {/* Example Socials */}
                        <span className="social-icon">Instagram</span>
                        <span className="social-icon">Twitter</span>
                        <span className="social-icon">LinkedIn</span>
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.form
                    className="contact-form"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="form-group">
                        <label>Your Name</label>
                        <input type="text" placeholder="John Doe" required />
                    </div>

                    <div className="form-group">
                        <label>Your Email</label>
                        <input type="email" placeholder="john@example.com" required />
                    </div>

                    <div className="form-group">
                        <label>Message</label>
                        <textarea rows="5" placeholder="How can we help you?" required></textarea>
                    </div>

                    <button type="submit" className="btn-primary w-full">Send Message</button>
                </motion.form>
            </div>
        </div>
    );
};

export default Contact;
