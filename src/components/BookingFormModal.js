import React, { useState, useEffect } from "react";
import "./BookingFormModal.css";
import InvoiceModal from "./InvoiceModal";

export default function BookingFormModal({ room, checkIn, checkOut, numRooms, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("");
  const [hotelName, setHotelName] = useState("Loading...");
  const [loading, setLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // ✅ Auto-fetch hotel name using room info
  useEffect(() => {
    const fetchHotelName = async () => {
      try {
        const res = await fetch(`https://backend-hotel-25mu.onrender.com/hotel-by-room/${room._id || room.roomId}`);
        const data = await res.json();
        if (res.ok && data.success && data.hotelName) {
          setHotelName(data.hotelName);
        } else {
          setHotelName("Unknown Hotel");
        }
      } catch (error) {
        console.error("Error fetching hotel name:", error);
        setHotelName("Unknown Hotel");
      }
    };

    if (room) fetchHotelName();
  }, [room]);

  // ✅ Handle booking
  const handleBooking = async () => {
    if (!name || !email || !phone || !guests || !hotelName || !checkIn || !checkOut) {
      alert("Please fill all booking fields before proceeding.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) {
      alert("Please login before booking.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        roomId: room?.roomId || room?._id,
        userId: user._id,
        guestName: name,
        guestsCount: Number(guests),
        checkIn,
        checkOut,
        numRooms: Number(numRooms || 1),
        hotelId: room?.hotelId ?? room?.hotelid ?? null,
        hotelName,
        email,
        phone,
      };

      const res = await fetch("https://backend-hotel-25mu.onrender.com/book-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`✅ Booking confirmed successfully at ${hotelName}!`);

        const invoiceInfo = {
          hotel: { name: hotelName },
          room: { roomType: room?.roomType || "Standard", price: room?.price || 0 },
          guestName: name,
          email,
          phone,
          checkIn,
          checkOut,
          numRooms,
          totalAmount: (room?.price || 0) * (numRooms || 1),
          createdAt: new Date().toISOString(),
        };

        // ✅ Save bill to backend
        try {
          const billRes = await fetch("https://backend-hotel-25mu.onrender.com/add-bill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoiceInfo),
          });
          const billData = await billRes.json();
          if (!billData.success) {
            console.error("⚠️ Bill not saved:", billData.message);
          }
        } catch (error) {
          console.error("Error saving bill:", error);
        }

        // ✅ Show invoice (no onClose here so modal stays mounted)
        setBookingData(invoiceInfo);
        setShowInvoice(true);
      } else {
        alert(`❌ ${data.message || "Booking failed. Please try again."}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Server error during booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!showInvoice && (
        <div className="bookingform-overlay">
          <div className="bookingform-modal">
            <button className="bookingform-close-btn" onClick={onClose}>
              &times;
            </button>

            <h2>🏨 Book: {hotelName}</h2>

            <div className="bookingform-form">
              <label>Full Name:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

              <label>Email Address:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

              <label>Phone Number:</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

              <label>Number of Guests:</label>
              <input
                type="number"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                min="1"
              />

              <label>Hotel Name:</label>
              <input type="text" value={hotelName} readOnly />

              <label>Check-In Date:</label>
              <input type="date" value={checkIn} readOnly />

              <label>Check-Out Date:</label>
              <input type="date" value={checkOut} readOnly />
            </div>

            <div className="bookingform-buttons">
              <button onClick={handleBooking} disabled={loading}>
                {loading ? "Booking..." : "Book Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoice && (
       <InvoiceModal
  booking={bookingData}
  onClose={() => {
    setShowInvoice(false);
    onClose(); // ✅ closes the booking form when invoice is closed
  }}
/>

      )}
    </>
  );
}
