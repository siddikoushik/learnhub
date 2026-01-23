import React from "react";
import "./Contact.css";
import { assets } from "../../assets/frontendImages";

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
                        <img src={assets.location} alt="Location" className="info-icon" />
                        <p>CVR College Of Engineering ,Mangalpalli,Ibrahimapatnam.</p>
                    </div>

                    <div className="info-item">
                        <img src={assets.mail} alt="Mail" className="info-icon" />
                        <p>siddusiddu5849@gmail.com</p>
                    </div>

                    <div className="info-item">
                        <img src={assets.phone} alt="Phone" className="info-icon" />
                        <p>+91 9063408229</p>
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
