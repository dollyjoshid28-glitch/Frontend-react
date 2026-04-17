import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HotelList.css";

export default function HotelList() {
  const [hotels, setHotels] = useState([]);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5050/hotels")
      .then((res) => res.json())
      .then((data) => setHotels(data))
      .catch((err) => console.error("Error fetching hotels:", err));
  }, []);

  const scroll = (direction) => {
    const { current } = scrollRef;
    current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

 return (
  <div className="hotel-list">
    <h2 className="popular-title">Popular Stays</h2>

    <div className="scroll-container">
      <button className="scroll-btn left" onClick={() => scroll("left")}>
        ❮
      </button>

      <div className="hotel-cards" ref={scrollRef}>
        {hotels.map((hotel) => (
          <div className="hotel-card" key={hotel.hotelid}>
            <img src={`/images/${hotel.image}`} alt={hotel.name} />
            <h3>{hotel.name}</h3>
            <p className="hotel-city">{hotel.city}</p>

            <div className="hotel-info">
              <span className="hotel-rating">⭐ {hotel.rating}</span>
              <span className="hotel-price">₹ {hotel.price} / night</span>
            </div>

            <button
              className="view-details-btn"
              onClick={() => navigate(`/hotel/${hotel.hotelid}`)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      <button className="scroll-btn right" onClick={() => scroll("right")}>
        ❯
      </button>
    </div>
  </div>
);
}
