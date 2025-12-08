import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import logo from "../images/logo1.png";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">

  <img src={logo} alt="My Travel Buddy Logo" className="logo-img" />
</Link>


      <div className="nav-links">
        <NavLink to="/" className="nav-item">Home</NavLink>
        <NavLink to="/packages" className="nav-item">Packages</NavLink>
        <NavLink to="/about" className="nav-item">About</NavLink>
        <NavLink to="/blog" className="nav-item">Blog</NavLink>
        <NavLink to="/contact" className="nav-item">Contact</NavLink>
        <NavLink to="/book" className="nav-item book-btn">Book Now</NavLink>
        <NavLink to="/login" className="btn">Login</NavLink>


      </div>
    </nav>
  );
}
