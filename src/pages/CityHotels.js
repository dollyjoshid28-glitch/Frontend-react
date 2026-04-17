import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CityHotels.css";

export default function CityHotels() {
  const { city } = useParams();
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [sortOption, setSortOption] = useState("highestRating");
  const [searchCity, setSearchCity] = useState(city || "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const navigate = useNavigate();

  // 🔹 Fetch all hotels and filter by current city
  useEffect(() => {
    fetch("http://127.0.0.1:5050/hotels")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (hotel) => hotel.city.toLowerCase() === city.toLowerCase()
        );
        setFilteredHotels(filtered);
      })
      .catch((err) => console.error("Error fetching hotels:", err));
  }, [city]);

  // 🔹 Sorting function
  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);

    const sorted = [...filteredHotels].sort((a, b) => {
      if (option === "lowestPrice") return a.price - b.price;
      if (option === "highestPrice") return b.price - a.price;
      if (option === "highestRating") return b.rating - a.rating;
      return 0;
    });
    setFilteredHotels(sorted);
  };

  // 🔹 Search handler — redirects to the selected city route
  const handleSearch = () => {
    if (searchCity.trim() === "") {
      alert("Please enter a city name to search!");
      return;
    }
    navigate(`/city/${searchCity}`);
  };

  return (
    <div className="city-hotels-page">
      {/* 🔍 Search Bar */}
      <div className="city-search-bar">
        <div className="search-item">
          <label>Where are you going?</label>
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Enter city"
          />
        </div>
        <div className="search-item">
          <label>Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div className="search-item">
          <label>Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
        <button className="search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* 🏨 Hotels Section */}
      <div className="city-hotels-container">
        <div className="city-hotels-header">
          <h2>
            {city}: {filteredHotels.length} properties found
          </h2>

          <div className="sort-dropdown">
            <label>Sort by: </label>
            <select value={sortOption} onChange={handleSortChange}>
              <option value="highestRating">Highest rating</option>
              <option value="lowestPrice">Lowest price</option>
              <option value="highestPrice">Highest price</option>
            </select>
          </div>
        </div>

        <div className="city-hotel-list">
          {filteredHotels.length === 0 ? (
            <p>No hotels found in {city}.</p>
          ) : (
            filteredHotels.map((hotel) => (
              <div
                key={hotel.hotelid}
                className="city-hotel-card"
                onClick={() => navigate(`/hotel/${hotel.hotelid}`)}
              >
                <img
                  src={`/images/${hotel.image}`}
                  alt={hotel.name}
                  className="city-hotel-image"
                />
                <div className="city-hotel-details">
                  <div className="city-hotel-header">
                    <h3>{hotel.name}</h3>
                    <div className="city-hotel-rating">
                      {Array(Math.round(hotel.rating))
                        .fill("⭐")
                        .join("")}
                      <span className="rating-number">{hotel.rating}</span>
                    </div>
                  </div>

                  <p className="city-hotel-location">{hotel.city}</p>
                  <p className="city-hotel-description">
                    {hotel.description}
                  </p>

                  <div className="city-hotel-footer">
                    <span className="price">₹{hotel.price} / night</span>
                    <button
                      className="book-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/hotel/${hotel.hotelid}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
