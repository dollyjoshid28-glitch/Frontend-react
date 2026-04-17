import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

export default function HeroSection() {
  const navigate = useNavigate();

  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleSearch = () => {
    // 🔹 Validation checks
    const today = new Date().toISOString().split("T")[0];

    if (!city) {
      alert("Please select a city!");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates!");
      return;
    }

    if (checkIn < today) {
      alert("Check-in date cannot be in the past!");
      return;
    }

    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date!");
      return;
    }

    // 🔹 Navigate to city hotels page
    navigate(`/city/${city}`);
  };

  return (
    <div className="hero">
      <div className="hero-overlay">
        <h1 className="hero-title">Book Perfect Stay For Your Vacation</h1>

        <div className="hero-searchbox">
          <div className="hero-form-group">
            <label>Where are you going?</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Select City</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Goa">Goa</option>
              <option value="Jaipur">Jaipur</option>
            </select>
          </div>

          <div className="hero-form-group">
            <label>Check In</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          <div className="hero-form-group">
            <label>Check Out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <button className="hero-search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
