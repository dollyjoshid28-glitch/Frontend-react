import React from "react";
import "./InvoiceModal.css";

export default function InvoiceModal({ booking, onClose }) {
  if (!booking) return null;

  const {
    hotel,
    room,
    guestName,
    email, // ✅ added email
    checkIn,
    checkOut,
    numRooms,
    totalAmount,
  } = booking;

  return (
    <div className="invoice-overlay">
      <div className="invoice-modal">
        <h2>🏨 Booking Invoice</h2>

        <div className="invoice-details">
          <p><strong>Hotel:</strong> {hotel?.name || "N/A"}</p>
          <p><strong>Room Type:</strong> {room?.roomType}</p>
          <p><strong>Guest Name:</strong> {guestName}</p>
          <p><strong>Email:</strong> {email}</p> {/* ✅ New line */}
          <p><strong>Check-In:</strong> {checkIn}</p>
          <p><strong>Check-Out:</strong> {checkOut}</p>
          <p><strong>Number of Rooms:</strong> {numRooms}</p>
          <p><strong>Price per Room:</strong> ₹{room?.price}</p>
          <hr />
          <h3><strong>Total Amount:</strong> ₹{totalAmount}</h3>
        </div>

            <button className="popup-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}
