import React from "react";
import "./Contact.css";

const Contact = () => {
    return (
        <div id="contact" className="contact-container container">
            <div className="section-header text-center">
                <h2 className="section-title">Get in Touch</h2>
                <p className="section-subtitle">Have questions? We'd love to hear from you.</p>
            </div>

            <div className="contact-content">
                <div className="contact-info">
                    <div className="info-item">
                        <h3>📍 Address</h3>
                        <p>123 Education Lane, Tech City, TC 90210</p>
                    </div>
                    <div className="info-item">
                        <h3>📧 Email</h3>
                        <p>support@learnhub.com</p>
                    </div>
                    <div className="info-item">
                        <h3>📞 Phone</h3>
                        <p>+1 (555) 123-4567</p>
                    </div>
                </div>

                <form className="contact-form">
                    <input type="text" placeholder="Your Name" required />
                    <input type="email" placeholder="Your Email" required />
                    <textarea rows="5" placeholder="Your Message" required></textarea>
                    <button type="submit" className="btn-primary">Send Message</button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
