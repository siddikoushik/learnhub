import { MapPin, Mail, Phone, User, MessageSquare, Send } from "lucide-react";
import { GithubIcon, InstagramIcon, TwitterIcon, LinkedinIcon } from "../SocialIcons";
import { motion } from "framer-motion";
import './Contact.css';


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
                            <div className="icon-box">
                                <MapPin size={24} />
                            </div>
                            <div className="info-text">
                                <h4>Location</h4>
                                <p>CVR College Of Engineering,<br />Mangalpalli, Ibrahimapatnam.</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="icon-box">
                                <Mail size={24} />
                            </div>
                            <div className="info-text">
                                <h4>Email</h4>
                                <p>siddikoushik321@gmail.com</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="icon-box">
                                <Phone size={24} />
                            </div>
                            <div className="info-text">
                                <h4>Phone</h4>
                                <p>+91 9063408229</p>
                            </div>
                        </div>
                    </div>

                    <div className="social-links">
                        <a href="#" className="social-icon instagram" aria-label="Instagram">
                            <InstagramIcon size={24} />
                        </a>
                        <a href="#" className="social-icon twitter" aria-label="Twitter">
                            <TwitterIcon size={24} />
                        </a>
                        <a href="#" className="social-icon linkedin" aria-label="LinkedIn">
                            <LinkedinIcon size={24} />
                        </a>
                        <a href="#" className="social-icon github" aria-label="Github">
                            <GithubIcon size={24} />
                        </a>
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.form
                    className="contact-form"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const name = formData.get("user_name");
                        const email = formData.get("user_email");
                        const message = formData.get("message");

                        // Construct the body properly encoded
                        const subject = encodeURIComponent(`Contact from ${name}`);
                        const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);

                        const mailtoLink = `mailto:siddikoushik321@gmail.com?subject=${subject}&body=${body}`;

                        // Open the mail client
                        window.location.href = mailtoLink;
                    }}
                >
                    <div className="form-group">
                        <label><User size={18} /> Your Name</label>
                        <input name="user_name" type="text" placeholder="John Doe" required />
                    </div>

                    <div className="form-group">
                        <label><Mail size={18} /> Your Email</label>
                        <input name="user_email" type="email" placeholder="john@example.com" required />
                    </div>

                    <div className="form-group full-width">
                        <label><MessageSquare size={18} /> Message</label>
                        <textarea name="message" rows="5" placeholder="How can we help you?" required></textarea>
                    </div>

                    <button type="submit" className="btn-primary">
                        Send Message <Send size={20} />
                    </button>
                </motion.form>
            </div>
        </div>
    );
};

export default Contact;
