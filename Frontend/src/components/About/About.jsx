import React from "react";
import "./About.css";
import { motion } from "framer-motion";

const About = () => {
  const features = [
    { title: "Expert Mentors", desc: "Learn from industry leaders from top tech companies.", icon: "👨‍🏫" },
    { title: "Interactive Learning", desc: "Live sessions, quizzes, and hands-on projects.", icon: "💻" },
    { title: "Career Guidance", desc: "Resume reviews and mock interviews to get you hired.", icon: "🚀" },
    { title: "Community Support", desc: "Join 10k+ learners helping each other grow.", icon: "🤝" },
  ];

  const testimonials = [
    { name: "Alex Johnson", role: "Software Engineer", comment: "LearnHub helped me switch careers from sales to tech in just 6 months!", image: "https://i.pravatar.cc/100?img=11" },
    { name: "Sarah Lee", role: "Product Designer", comment: "The mentorship I received here was invaluable. Highly recommended!", image: "https://i.pravatar.cc/100?img=5" },
    { name: "David Kim", role: "Data Scientist", comment: "Best platform for deep diving into detailed technical topics.", image: "https://i.pravatar.cc/100?img=3" },
  ];

  return (
    <div className="about-container container">

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="section-header text-center">
          <h2 className="section-title">Why Choose LearnHub?</h2>
          <p className="section-subtitle">We provide everything you need to succeed in your career.</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              className="card feature-card"
              key={index}
              whileHover={{ y: -5 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonials-section">
        <div className="section-header text-center">
          <h2 className="section-title">Trusted by Thousands</h2>
          <p className="section-subtitle">See what our community has to say.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, index) => (
            <div className="card testimonial-card" key={index}>
              <p className="comment">"{t.comment}"</p>
              <div className="user-info">
                <img src={t.image} alt={t.name} />
                <div>
                  <h4>{t.name}</h4>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join LearnHub today and get access to your first course for free.</p>
          <button className="btn-primary btn-large">Get Started Now</button>
        </div>
      </section>

    </div>
  );
};

export default About;
