import React from "react";
import "./About.css";
import { motion } from "framer-motion";

const About = () => {
  const features = [
    { title: "Expert Mentors", desc: "Learn from industry leaders from top tech companies.", icon: "👨‍🏫" },
    { title: "Interactive Learning", desc: "Live sessions, quizzes, and hands-on projects.", icon: "💻" },
    { title: "Community Support", desc: "Join 10k+ learners helping each other grow.", icon: "🤝" },
  ];

  const testimonials = [
    { name: "Rahul Verma", role: "Computer Science Student", comment: "The interactive whiteboard made learning Algorithms so much easier. My tutor was fantastic!", image: "https://randomuser.me/api/portraits/men/15.jpg" },
    { name: "Emily Blunt", role: "Math Tutor", comment: "LearnHub connects me with motivated students. The scheduling tools are a lifesaver.", image: "https://randomuser.me/api/portraits/women/42.jpg" },
    { name: "James Carter", role: "Career Switcher", comment: "I went from zero coding knowledge to a Junior Dev role thanks to the mentorship here.", image: "https://randomuser.me/api/portraits/men/22.jpg" },
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


    </div>
  );
};

export default About;
