import React from "react";
import "./Footer.css";
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from "../SocialIcons";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <h2 className="footer-logo">Learn<span>Hub</span></h2>
          <p className="footer-text">
            Empowering students to learn, connect, and grow through smart education.
          </p>
        </div>

        {/* Links Section */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/#about">About</a></li>
            <li><a href="/#contact">Contact</a></li>
          </ul>
        </div>

        {/* Support Section */}
        <div className="footer-links">
          <h4>Support</h4>
          <ul>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/help">Help Center</a></li>
          </ul>
        </div>

        {/* Social Section */}
        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" className="social-icon-wrapper facebook" aria-label="Facebook">
              <FacebookIcon size={20} />
            </a>
            <a href="#" className="social-icon-wrapper instagram" aria-label="Instagram">
              <InstagramIcon size={20} />
            </a>
            <a href="#" className="social-icon-wrapper linkedin" aria-label="LinkedIn">
              <LinkedinIcon size={20} />
            </a>
            <a href="#" className="social-icon-wrapper twitter" aria-label="Twitter">
              <TwitterIcon size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} <strong>LearnHub</strong>. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
