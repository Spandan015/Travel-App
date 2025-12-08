import React from "react";
import { Link } from "react-router-dom";

export default function NotFound(){
  return (
    <div className="card">
      <h2 className="h">404 — Page not found</h2>
      <p className="sub">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn btn-primary">Back home</Link>
    </div>
  );
}
