import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyBookings.css";
import FeedbackModal from "../components/FeedbackModal";

// --- NEW CUSTOM HOOK: Use this to fetch the hotel name if it's missing ---
const useHotelName = (initialHotelName, roomId) => {
  const [hotelName, setHotelName] = useState(initialHotelName || "Unknown Hotel");

  useEffect(() => {
    if (!roomId) return;
    
    // Only fetch if the initial name is generic (or null/undefined)
    if (initialHotelName && initialHotelName !== "Unknown Hotel") {
        setHotelName(initialHotelName);
        return;
    }

    async function loadHotel() {
      try {
        const res = await fetch(`http://127.0.0.1:5050/hotel-by-room/${roomId}`);
        const data = await res.json();
        if (data.success && data.hotelName) {
          setHotelName(data.hotelName);
        }
      } catch (err) {
        console.log("Hotel fetch error:", err);
      }
    }
    loadHotel();
  }, [roomId, initialHotelName]); // Depend on roomId and the initial name

  return hotelName;
};
// --------------------------------------------------------------------------

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [bills, setBills] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // --- Data Fetching Logic (Unchanged) ---
  useEffect(() => {
    if (!user?._id) return;

    const fetchBookings = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5050/mybookings/${user._id}`);
        const data = await res.json();

        if (data.success) {
          setBookings(data.bookings);

          data.bookings.forEach(async (b) => {
            // Fetch feedbacks
            const fbRes = await fetch(`http://127.0.0.1:5050/feedback/${b._id}`);
            const fbData = await fbRes.json();
            if (fbData.success) {
              setFeedbacks((prev) => ({ ...prev, [b._id]: fbData.feedback }));
            }
            // Fetch bills
            try {
              const billRes = await fetch(`http://127.0.0.1:5050/bill/by-booking/${b._id}`);
              const billData = await billRes.json();
              if (billData.success && billData.bill) {
                setBills((prev) => ({ ...prev, [b._id]: billData.bill }));
              }
            } catch (err) {
              console.warn("Bill fetch failed for booking:", b._id);
            }
          });
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("⚠️ Failed to load your bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?._id]);

  // --- Action Handlers (Unchanged) ---
  const handleCancelBooking = async (bookingId, hotelName) => {
    if (!bookingId) return;
    if (!window.confirm(`Cancel booking for ${hotelName}?`)) return;

    try {
      const res = await fetch(`http://127.0.0.1:5050/cancel-booking/${bookingId}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Booking cancelled.");
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, bookingStatus: "Cancelled" } : b
          )
        );
      } else alert("⚠️ " + data.message);
    } catch (err) {
      console.error("Cancel error:", err);
      alert("❌ Error cancelling booking.");
    }
  };

  const openFeedbackModal = (booking) => {
    setSelectedBooking(booking);
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setRating("");
    setComment("");
    setSelectedBooking(null);
  };

  const handleSubmitFeedback = async () => {
    if (!rating || !comment) return alert("Please provide rating & comment.");

    const res = await fetch("http://127.0.0.1:5050/add-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        bookingId: selectedBooking._id,
        hotelId: selectedBooking.hotelId,
        rating,
        comment,
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert("🌟 Feedback submitted!");
      setFeedbacks((prev) => ({
        ...prev,
        [selectedBooking._id]: { rating, comment, _id: data.feedbackId || 'temp_id' }, 
      }));
      closeFeedbackModal();
    } else alert("⚠️ Failed to submit feedback.");
  };

  const handleDeleteFeedback = async (feedbackId, bookingId) => {
    if (!window.confirm("Delete this feedback?")) return;

    const res = await fetch(`http://127.0.0.1:5050/feedback/${feedbackId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ Feedback deleted.");
      setFeedbacks((prev) => {
        const copy = { ...prev };
        delete copy[bookingId];
        return copy;
      });
    } else alert("⚠️ Failed to delete feedback.");
  };

  if (loading) return <div className="mybookings-container">Loading...</div>;
  if (error) return <div className="mybookings-container">{error}</div>;

const normalizeDate = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

console.log("BOOKINGS:", bookings);

const today = normalizeDate(new Date());

const upcoming = bookings.filter(
  (b) =>
    normalizeDate(b.checkOut) >= today &&
    b.bookingStatus !== "Cancelled"
);

const past = bookings.filter(
  (b) =>
    normalizeDate(b.checkOut) < today ||
    b.bookingStatus === "Cancelled"
);
  // --- Utility Functions ---
  const getBookingData = (b) => {
    const bill = bills[b._id];
    const room = b.roomDetails?.[0];

    const roomType = b.roomType || room?.roomType || "N/A";
    const price =
      b.price ||
      b.roomPrice ||
      room?.price ||
      bill?.room?.price ||
      b.totalPrice / (b.numRooms || 1) ||
      0;

    const totalAmount =
      b.totalAmount ||
      b.totalPrice ||
      bill?.totalAmount ||
      price * (b.numRooms || 1);
      
    // Use the name directly from booking if available, otherwise it will be "Unknown Hotel"
    const initialHotelName = b.hotelName || "Unknown Hotel";

    return { roomType, price, totalAmount, initialHotelName };
  };

  // --- UPDATED: Upcoming Booking Card Component ---
  const UpcomingBookingCard = ({ b }) => {
    const { roomType, totalAmount, initialHotelName } = getBookingData(b);
    
    // 🔥🔥 NEW: Use the custom hook to get the potentially updated hotel name 🔥🔥
    const hotelName = useHotelName(initialHotelName, b.roomId);

    const bookingStatus = b.bookingStatus || "Confirmed";
    const statusClass = bookingStatus.toLowerCase().replace(' ', '');

    return (
      <div
        className="booking-card clickable"
        onClick={() => {
          if (b.hotelId) navigate(`/hotel/${b.hotelId}`, { state: { bookingId: b._id } });
          else alert("Hotel ID missing for this booking.");
        }}
      >
        <div className="booking-header">
          <h3>{hotelName}</h3> {/* Corrected usage */}
          <span className={`status ${statusClass}`}>{bookingStatus}</span>
        </div>

        <div className="booking-details-group">
          <div className="detail-item">
            <span className="detail-label">Guest</span>
            <span className="detail-value">{b.guestName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Check-In</span>
            <span className="detail-value">{new Date(b.checkIn).toDateString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Check-Out</span>
            <span className="detail-value">{new Date(b.checkOut).toDateString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Room Type</span>
            <span className="detail-value">{roomType}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Rooms</span>
            <span className="detail-value">{b.numRooms}</span>
          </div>
        </div>

        <div className="booking-price-actions">
            <div className='price-info'>
                <div className="price-value">₹{totalAmount.toLocaleString()}</div>
                <div className="price-label">Total Paid/Amount</div>
            </div>

            <div className="booking-actions">
              {/* Show Cancel button only for upcoming & non-cancelled */}
              {new Date(b.checkOut) >= new Date() && bookingStatus !== "Cancelled" && (
                <button
                  className="cancel-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelBooking(b._id, hotelName);
                  }}
                >
                  Cancel Booking
                </button>
              )}
            </div>
        </div>
      </div>
    );
  };

  // --- UPDATED: Past Bookings Table Row Component ---
  const PastBookingRow = ({ b }) => {
    const { roomType, totalAmount, initialHotelName } = getBookingData(b);
    
    // 🔥🔥 NEW: Use the custom hook to get the potentially updated hotel name 🔥🔥
    const hotelName = useHotelName(initialHotelName, b.roomId);

    const feedback = feedbacks[b._id];
    const bookingStatus = b.bookingStatus || "Confirmed";
    const statusClass = bookingStatus.toLowerCase().replace(' ', '');
    const isCancelled = bookingStatus === "Cancelled";

    const renderFeedback = () => {
      if (isCancelled) return "N/A";
      
      if (feedback) {
        return (
          <div className="feedback-section">
            <p>⭐ {feedback.rating} — {feedback.comment}</p>
            <button
              className="delete-feedback-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFeedback(feedback._id, b._id);
              }}
            >
              Delete
            </button>
          </div>
        );
      } else {
        return (
          <button
            className="feedback-btn"
            onClick={(e) => {
              e.stopPropagation();
              openFeedbackModal(b);
            }}
          >
            Give Feedback
          </button>
        );
      }
    };


    return (
      <tr
        className="clickable"
        onClick={() => {
            if (b.hotelId) navigate(`/hotel/${b.hotelId}`, { state: { bookingId: b._id } });
            else alert("Hotel ID missing for this booking.");
        }}
      >
        <td data-label="Hotel Name">{hotelName}</td> {/* Corrected usage */}

        <td data-label="Check-In">{new Date(b.checkIn).toLocaleDateString()}</td>
        <td data-label="Check-Out">{new Date(b.checkOut).toLocaleDateString()}</td>
        <td data-label="Room Type">{roomType}</td>   {/* 🔥 ADDED COLUMN */}
        <td data-label="Rooms">{b.numRooms}</td>
        <td data-label="Total Amount">₹{totalAmount.toLocaleString()}</td>
        <td data-label="Status">
          <span className={`status ${statusClass}`}>{bookingStatus}</span>
        </td>
        <td data-label="Action/Feedback">{renderFeedback()}</td>
      </tr>
    );
  };

  // --- Main Render ---
  return (
    <div className="mybookings-container">
      <h2>My Bookings</h2>

      <div className="booking-section">
        <h3 className="section-title">Upcoming Bookings</h3>
        <div className="bookings-grid">
          {upcoming.length ? (
            upcoming.map((b) => <UpcomingBookingCard key={b._id} b={b} />)
          ) : (
            <p>No upcoming bookings found. Book your next stay now!</p>
          )}
        </div>
      </div>

      <div className="booking-section">
        <h3 className="section-title">Past & Cancelled Bookings</h3>
        <div className="bookings-grid">
          {past.length ? (
            <table className="past-bookings-table">
              <thead>
                <tr>
                  <th>Hotel Name</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Room Type</th>   {/* 🔥 NEW HEADER */}
                  <th>Rooms</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {past.map((b) => <PastBookingRow key={b._id} b={b} />)}
              </tbody>
            </table>
          ) : (
            <p>No past or cancelled bookings yet.</p>
          )}
        </div>
      </div>

      {showFeedbackModal && selectedBooking && (
        <FeedbackModal
          booking={selectedBooking}
          onClose={closeFeedbackModal}
          onSubmit={({ rating, comment }) => {
            setRating(rating);
            setComment(comment);
            handleSubmitFeedback();
          }}
        />
      )}
    </div>
  );
}