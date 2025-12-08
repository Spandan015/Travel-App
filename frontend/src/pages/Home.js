import React from "react";
import { Link } from "react-router-dom";
import nepalImg from "../images/nepal.jpg";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",        
        width: "100%",              
        overflowX: "hidden",        
        backgroundImage: `url(${nepalImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="card"
        style={{
          textAlign: "center",
          padding: 20,
          backgroundColor: "rgba(255,255,255,0.8)",
          borderRadius: 10,
        }}
      >
        <h2 className="h">Welcome to My Travel Buddy</h2>
        <p className="sub">Plan your trip, book hotels and guides across Nepal.</p>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <Link to="/hotels" className="btn btn-primary">
            Browse Hotels
          </Link>
        </div>
      </div>
    </div>
  );
}
