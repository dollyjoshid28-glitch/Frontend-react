import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import BookingPopup from "../components/BookingPopup";
import BookingFormModal from "../components/BookingFormModal";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "./HotelDetails.css";

export default function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({});

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetch(`https://backend-hotel-25mu.onrender.com/hotels/${id}`)
      .then((res) => res.json())
      .then((data) => setHotel(data))
      .catch(() => setError("Unable to load hotel details."));

    fetch(`https://backend-hotel-25mu.onrender.com/rooms/${id}`)
      .then((res) => res.json())
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .catch(() => setRooms([]));
  }, [id]);

  const handleCheckAvailabilityClick = (room) => {
    setSelectedRoom(room);
    setShowBookingPopup(true);
  };

  const handleCheckAvailability = async (checkIn, checkOut, numRooms) => {
    if (!selectedRoom || !selectedRoom.roomId) {
      alert("Room details missing.");
      return;
    }
    if (!checkIn || !checkOut || !numRooms) {
      alert("Please fill all booking fields before proceeding.");
      return;
    }

    try {
      const res = await fetch("https://backend-hotel-25mu.onrender.com/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoom.roomId,
          checkIn,
          checkOut,
          numRooms: Number(numRooms),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Server error checking availability");
        return;
      }

      if (!data.available) {
        alert("❌ Not enough rooms available!");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setShowLoginModal(true);
        return;
      }

      setBookingDetails({ checkIn, checkOut, numRooms });
      setShowBookingPopup(false);
      setShowBookingForm(true);
    } catch (err) {
      console.error("Error checking availability:", err);
      alert("Server error while checking availability");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < full; i++) stars.push(<FaStar key={i} color="#FFD700" />);
    if (half) stars.push(<FaStarHalfAlt key="half" color="#FFD700" />);
    while (stars.length < 5) stars.push(<FaRegStar key={stars.length} color="#FFD700" />);
    return stars;
  };

  if (error) return <p className="hdp-error">{error}</p>;
  if (!hotel) return <p className="hdp-loading">Loading...</p>;

  return (
    <div className="hdp-container">
      {/* HEADER */}
      <div className="hdp-header">
        <div className="hdp-image-wrapper">
          <img src={`/images/${hotel.image}`} alt={hotel.name} className="hdp-main-image" />
        </div>
        <div className="hdp-info">
          <h1 className="hdp-name">{hotel.name}</h1>
          <div className="hdp-rating">{renderStars(hotel.rating)}</div>
          <p className="hdp-city">{hotel.city}</p>
          <p className="hdp-desc">{hotel.description}</p>
          <p className="hdp-price">From ₹{hotel.price} / night</p>
        </div>
      </div>

      {/* AMENITIES */}
      {hotel.amenities?.length > 0 && (
        <div className="hdp-amenities">
          <h2>Highlights</h2>
          <div className="hdp-amenities-list">
            {hotel.amenities.map((item, i) => (
              <span key={i} className="hdp-amenity">{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* ROOMS */}
      <h2 className="hdp-room-title">Available Rooms</h2>
      <div className="hdp-rooms">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div className="hdp-room-card" key={room._id}>
              <img src={`/images/${room.image}`} alt={room.roomType} className="hdp-room-image" />
              <div className="hdp-room-info">
                <h3>{room.roomType}</h3>
                <p>{room.description}</p>
                <p className="hdp-room-price">₹{room.price} / night</p>
                <div className="hdp-btn-container">
                  <button
                    className="hdp-room-btn"
                    onClick={() => handleCheckAvailabilityClick(room)}
                  >
                    Check Availability
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="hdp-no-rooms">No rooms available right now.</p>
        )}
      </div>

      {/* MODALS */}
      {showBookingPopup && (
        <BookingPopup
          room={selectedRoom}
          onClose={() => setShowBookingPopup(false)}
          onAvailabilityChecked={handleCheckAvailability}
        />
      )}

      {showBookingForm && (
        <BookingFormModal
          room={selectedRoom}
          checkIn={bookingDetails.checkIn}
          checkOut={bookingDetails.checkOut}
          numRooms={bookingDetails.numRooms}
          onClose={() => setShowBookingForm(false)}
        />
      )}

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
}
