import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PopularStays.css";

export default function PopularStays() {
  const [popularCities, setPopularCities] = useState([]);
  const navigate = useNavigate();

  const cityImages = {
    Goa: "Goa.jpeg",
    Delhi: "Delhi.jpg",
    Jaipur: "Jaipur.jpeg",
    Mumbai: "Mumbai.jpeg",
    Udaipur: "Udaipur.jpeg",
  };

  useEffect(() => {
    fetch("https://backend-hotel-25mu.onrender.com/hotels")
      .then((res) => res.json())
      .then((data) => {
        const cityCount = {};
        data.forEach((hotel) => {
          cityCount[hotel.city] = (cityCount[hotel.city] || 0) + 1;
        });

        const topCities = Object.entries(cityCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([city]) => ({
            city,
            image: cityImages[city] || "default.jpg",
          }));

        setPopularCities(topCities);
      })
      .catch((err) => console.error("Error fetching hotels:", err));
  }, );

  return (
    <div className="popular-stays">
      <h2>🌴 Popular Destinations</h2>
      <div className="city-grid">
        {popularCities.map((item, index) => (
          <div
            className="city-card"
            key={index}
            style={{ backgroundImage: `url(/images/${item.image})` }}
            onClick={() => navigate(`/city/${item.city}`)}
          >
            <div className="overlay">
              <h3>{item.city}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
