// src/pages/HomePage.jsx
import React from "react";
import "../Styles/Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <a href="#" className="nav-item">Home</a>
          <a href="#" className="nav-item">Events</a>
          <a href="#" className="nav-item">About</a>
          <a href="#" className="nav-item">Contact</a>
        </div>
        <div className="nav-right">
          <button className="btn-login" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-signup" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <h1>
            Connect, Compete, <span>Celebrate</span>
          </h1>
          <p>
            Discover, participate, and organize amazing events across colleges.
            Connect with peers, showcase talents, and create memorable
            experiences.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">Join as Student</button>
            <button className="btn-primary">Register College</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
