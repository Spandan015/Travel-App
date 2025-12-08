import React from "react";
import "./Packages.css";

export default function Packages() {
  const packages = [
    {
      id: 1,
      title: "Pokhara Tour Package",
      description: "3 nights, 4 days — Lakes, mountains, and adventure.",
      price: "₹18,000",
      img: "https://images.unsplash.com/photo-1565452001918-b0f6b9f3d02b"
    },
    {
      id: 2,
      title: "Chitwan Jungle Safari",
      description: "2 nights, 3 days — Wildlife, jeep safari, cultural shows.",
      price: "₹14,500",
      img: "https://images.unsplash.com/photo-1544986581-efac024faf62"
    },
    {
      id: 3,
      title: "Everest Base Camp Trek",
      description: "12 days — Trekking adventure to the world's tallest peak.",
      price: "₹65,000",
      img: "https://images.unsplash.com/photo-1509644851326-67471c14839d"
    },
  ];

  return (
    <div className="packages-page">
      <h1>Tour & Travel Packages</h1>
      <div className="package-grid">
        {packages.map((p) => (
          <div key={p.id} className="package-card">
            <img src={p.img} alt={p.title} />
            <h2>{p.title}</h2>
            <p>{p.description}</p>
            <span className="price">{p.price}</span>
            <button className="view-btn">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}
