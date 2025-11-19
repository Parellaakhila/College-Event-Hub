// src/pages/HomePage.jsx
import React, { useState } from "react";
import "../Styles/Home.css";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="home-wrapper">
      {/* NAVBAR */}
      <nav className="nav">
        <div className="nav-logo">CampusEventHub</div>

        {/* HAMBURGER */}
        <div className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a href="#">Home</a>
          <a href="#">Events</a>
          <a href="#">About</a>
          <a href="#">Contact</a>

          <div className="nav-actions-mobile">
            <button onClick={() => navigate("/login")} className="btn-outline">
              Login
            </button>
            <button onClick={() => navigate("/signup")} className="btn-primary">
              Sign Up
            </button>
          </div>
        </div>

        {/* DESKTOP BUTTONS */}
        <div className="nav-actions">
          <button onClick={() => navigate("/login")} className="btn-outline">
            Login
          </button>
          <button onClick={() => navigate("/signup")} className="btn-primary">
            Sign Up
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-left">
          <h1>
            Connect, Compete & <span>Celebrate</span>
          </h1>
          <p>
            Discover and participate in exciting college events. Connect with peers, explore opportunities, and create memorable experiences.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary">Join as Student</button>
            <button className="btn-outline">Register College</button>
          </div>
        </div>

        <div className="hero-right">
          <img
            src="https://img.freepik.com/free-vector/flat-university-concept-background_52683-11176.jpg"
            alt="Events Illustration"
          />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features">
        <h2>Why CampusEventHub?</h2>

        <div className="features-grid">
          <div className="feature-card">
            <img src="https://img.freepik.com/free-vector/happy-tiny-business-people-dancing-having-fun-drinking-wine-corporate-party-team-building-activity-corporate-event-idea-concept-pinkish-coral-bluevector-isolated-illustration_335657-1414.jpg" />
            <h3>Explore Unlimited Events</h3>
            <p>Browse events from multiple colleges and find what interests you.</p>
          </div>

          <div className="feature-card">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1ltPl5FLsN4O_0RpqCHSXyMwGqySQRfN6iy5Y50M1XsiG7obul9cAhW36CBXGQkEjSBU" />
            <h3>Compete With Students</h3>
            <p>Participate and compete with students across universities.</p>
          </div>

          <div className="feature-card">
            <img src="https://img.freepik.com/premium-vector/talent-concept-talented-tiny-woman-big-star-smartphone-screen-super-staropen-your-potential_501813-972.jpg" />
            <h3>Showcase Your Talents</h3>
            <p>Build your profile and stand out through performances & skills.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2025 CampusEventHub — All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
