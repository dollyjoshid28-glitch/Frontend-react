import React, { useState } from "react";
import "./BookingPopup.css";

export default function BookingPopup({ room, onClose, onAvailabilityChecked }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numRooms, setNumRooms] = useState(1);
  const [loading, setLoading] = useState(false);

  console.log("📤 Sending:", {
    roomId: room.roomId || room._id,
    checkIn,
    checkOut,
    numRooms,
  });

  const handleCheckNow = async () => {
    if (!checkIn || !checkOut) {
      alert("⚠️ Please select check-in and check-out dates.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://backend-hotel-25mu.onrender.com/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.roomId,
          checkIn,
          checkOut,
          numRooms,
        }),
      });

      const data = await res.json();
      console.log("📩 Availability response:", data);

      if (!res.ok) {
        alert(`⚠️ ${data.message || "Server error while checking availability."}`);
        return;
      }

      if (data.available) {
        alert(`✅ ${data.availableRooms || numRooms} room(s) available for selected dates!`);

        // ✅ Tell parent to open booking form modal
        onAvailabilityChecked(checkIn, checkOut, numRooms);
        onClose(); // close this popup
      } else {
        alert(`❌ ${data.message || "No rooms available for the selected dates."}`);
      }
    } catch (err) {
      console.error("❌ Error checking availability:", err);
      alert("🚨 Error checking availability. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        {/* ✅ Close button now properly placed */}
       <button className="popup-close" onClick={onClose}>×</button>


       


        <h3>Check Availability - {room.roomType}</h3>

        <label>Check-in Date:</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
        />

        <label>Check-out Date:</label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />

        <label>Number of Rooms:</label>
        <input
          type="number"
          min="1"
          max={room.numberOfRooms || 1}
          value={numRooms}
          onChange={(e) => setNumRooms(e.target.value)}
        />

        <div className="popup-buttons">
          <button onClick={handleCheckNow} disabled={loading}>
            {loading ? "Checking..." : "Check Now"}
          </button>
          
        </div>
        
      </div>
    </div>
  );
}
