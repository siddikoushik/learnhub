import React from "react";
import "./Hero.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logoHero from "../../assets/logo_full_centered.png"; // Import new full logo

const CountUp = ({ end, duration, suffix = "", isFloat = false }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      const currentVal = progress * end;
      setCount(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return (
    <span>
      {isFloat ? count.toFixed(1) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="container hero-container">

        {/* Left Text */}
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge-new">
            <span>✨ New Platform for 2026</span>
          </div>

          <h1 className="hero-title">
            Master Skills with <br />
            <span>World-Class Mentors</span>
          </h1>

          <p className="hero-description">
            LearnHub connects you with expert tutors to accelerate your career.
            Join a community of 10,000+ learners today.
          </p>



          <div className="stats-row">
            <div className="stat-item">
              <h3><CountUp end={10000} duration={2000} suffix="+" /></h3>
              <p>Active Students</p>
            </div>
            <div className="stat-item">
              <h3><CountUp end={500} duration={2000} suffix="+" /></h3>
              <p>Expert Tutors</p>
            </div>
            <div className="stat-item">
              <h3><CountUp end={4.9} duration={2000} isFloat /></h3>
              <p>User Rating</p>
            </div>
          </div>
        </motion.div>

        {/* Right Visual */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="decorative-circle">
            <img src={logoHero} alt="LearnHub Logo" className="hero-logo-img" />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
