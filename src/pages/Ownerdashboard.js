import React, { useEffect, useState } from "react";
import "./OwnerDashboard.css";

export default function OwnerDashboard() {
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);

  const [editingHotel, setEditingHotel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [addingRoomHotel, setAddingRoomHotel] = useState(null);
  const [formData, setFormData] = useState({});
  const owner = JSON.parse(localStorage.getItem("user"));

  // ✅ Payment Update
  const handleBillPaymentUpdate = async (billId) => {
    try {
      if (!billId) return console.error("❌ Missing bill ID");

      const res = await fetch(
        `https://backend-hotel-25mu.onrender.com/update-bill-payment/${billId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus: "Paid" }),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("✅ Payment marked as Paid!");
        setBookings((prev) =>
          prev.map((b) =>
            b._id === billId ? { ...b, paymentStatus: "Paid" } : b
          )
        );
      } else alert("❌ Failed to update payment status!");
    } catch (err) {
      console.error("Error updating payment:", err);
    }
  };

  // ✅ Fetch Hotels by Owner
  useEffect(() => {
    if (!owner?.email) return;
    const fetchHotels = async () => {
      try {
        const res = await fetch(
          `https://backend-hotel-25mu.onrender.com/owner-hotels/${encodeURIComponent(
            owner.email
          )}`
        );
        const data = await res.json();
        if (data.success) {
          setHotels(data.hotels);
          data.hotels.forEach((hotel) => fetchRooms(hotel.hotelid));
        }
      } catch (err) {
        console.error("Error fetching hotels:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [owner.email]);

  // ✅ Fetch Rooms for each hotel
  const fetchRooms = async (hotelid) => {
    try {
      const res = await fetch(`https://backend-hotel-25mu.onrender.com/rooms/${hotelid}`);
      const data = await res.json();
      if (Array.isArray(data))
        setRooms((prev) => ({ ...prev, [hotelid]: data }));
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  // ✅ Fetch Bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          `https://backend-hotel-25mu.onrender.com/owner-bookings/${encodeURIComponent(
            owner.email
          )}`
        );
        const data = await res.json();
        if (data.success) setBookings(data.bookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };
    if (owner?.email) fetchBookings();
  }, [owner.email]);

  // ✅ Edit Hotel
  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      city: hotel.city,
      price: hotel.price,
      rating: hotel.rating,
      description: hotel.description,
      amenities: hotel.amenities.join(", "),
    });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        `https://backend-hotel-25mu.onrender.com/update-hotel/${editingHotel._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            amenities: formData.amenities.split(",").map((a) => a.trim()),
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("✅ Hotel updated successfully!");
        setEditingHotel(null);
        setHotels((prev) =>
          prev.map((h) =>
            h._id === editingHotel._id ? { ...h, ...formData } : h
          )
        );
      } else alert("❌ Update failed!");
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // ✅ Edit Room
  const handleRoomEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomType: room.roomType || "",
      price: room.price || "",
      description: room.description || "",
      availability: room.availability || "Available",
      numberOfRooms: room.numberOfRooms || 1,
    });
  };

  const handleRoomSave = async () => {
    try {
      const res = await fetch(
        `https://backend-hotel-25mu.onrender.com/update-room/${editingRoom._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("✅ Room updated successfully!");
        setRooms((prev) => {
          const hotelRooms = prev[editingRoom.hotelId] || [];
          const updated = hotelRooms.map((r) =>
            r._id === editingRoom._id ? { ...r, ...formData } : r
          );
          return { ...prev, [editingRoom.hotelId]: updated };
        });
        setEditingRoom(null);
      } else alert("❌ Failed to update room!");
    } catch (err) {
      console.error("Error updating room:", err);
    }
  };

  // ✅ Delete Room
  const handleRoomDelete = async (roomId, hotelId) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      const res = await fetch(
        `https://backend-hotel-25mu.onrender.com/delete-room/${roomId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setRooms((prev) => ({
          ...prev,
          [hotelId]: prev[hotelId].filter((r) => r._id !== roomId),
        }));
      }
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  // ✅ Add Room Modal
  const handleAddRoom = (hotel) => {
    setAddingRoomHotel(hotel);
    setFormData({
      roomId: "",
      roomType: "",
      price: "",
      image: "",
      description: "",
      availability: "Available",
      numberOfRooms: 1,
    });
  };

  const handleAddRoomSave = async () => {
    try {
      const newRoom = { ...formData, hotelId: addingRoomHotel.hotelid };
      const res = await fetch("https://backend-hotel-25mu.onrender.com/add-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoom),
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Room added successfully!");
        setRooms((prev) => ({
          ...prev,
          [addingRoomHotel.hotelid]: [
            ...(prev[addingRoomHotel.hotelid] || []),
            newRoom,
          ],
        }));
        setAddingRoomHotel(null);
      } else alert("❌ Failed to add room!");
    } catch (err) {
      console.error("Error adding room:", err);
    }
  };

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="owner-dashboard">
   <h1>{hotels[0]?.name || "Hotel"} Management</h1>

      {/* === Hotels and Rooms === */}
      {hotels.map((hotel) => (
        <div key={hotel._id || hotel.hotelid} className="hotel-section">
          <div className="table-container">
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>Hotel ID</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Price (₹)</th>
                  <th>Rating</th>
                  <th>Amenities</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{hotel.hotelid}</td>
                  <td>{hotel.name}</td>
                  <td>{hotel.city}</td>
                  <td>{hotel.price}</td>
                  <td>{hotel.rating}</td>
                  <td>
                    {Array.isArray(hotel.amenities)
                      ? hotel.amenities.join(", ")
                      : hotel.amenities || "N/A"}
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(hotel)}
                    >
                      Edit
                    </button>
                    <button
                      className="addroom-btn"
                      onClick={() => handleAddRoom(hotel)}
                    >
                      Add Room
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* === Rooms for this Hotel === */}
          <h3 className="rooms-header">Rooms for {hotel.name}</h3>
          <div className="table-container">
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>Room ID</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Availability</th>
                  <th>Rooms Left</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!rooms[hotel.hotelid] || rooms[hotel.hotelid].length === 0 ? (
                  <tr>
                    <td colSpan="7">No rooms found for this hotel.</td>
                  </tr>
                ) : (
                  rooms[hotel.hotelid].map((r, index) => (
                  <tr key={r._id || r.roomId || Math.random()}>
                      <td>{r.roomId}</td>
                      <td>{r.roomType}</td>
                      <td>₹{r.price}</td>
                      <td>{r.description}</td>
                      <td>{r.availability}</td>
                      <td>{r.numberOfRooms}</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => handleRoomEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => handleRoomDelete(r._id, r.hotelId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* ✅ Recent Bookings Section — Restored */}
      <h2 className="bookings-header">Recent Bookings</h2>
      <div className="table-container">
        <table className="hotel-table">
          <thead>
            <tr>
              <th>Hotel</th>
              <th>Guest</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Rooms</th>
              <th>Booking Status</th>
              <th>Payment Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="8">No bookings yet.</td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr
                  key={
                    b.billId ||
                    b._id ||
                    `${b.hotelName}-${b.guestName}-${b.checkIn}`
                  }
                >
                  <td>{b.hotelName}</td>
                  <td>{b.guestName}</td>
                  <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(b.checkOut).toLocaleDateString()}</td>
                  <td>{b.numRooms}</td>
                  <td>{b.bookingStatus}</td>
                  <td>{b.paymentStatus}</td>
                  <td>
                    {b.paymentStatus === "Pending" ? (
                      <button
                        className="edit-btn"
                        onClick={() => handleBillPaymentUpdate(b.billId)}
                      >
                        Mark As Paid
                      </button>
                    ) : (
                      <span className="paid-label">✅ Paid</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* === Add Room Modal === */}
      {addingRoomHotel && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Room for {addingRoomHotel.name}</h2>
            <label>Room ID</label>
            <input
              value={formData.roomId}
              onChange={(e) =>
                setFormData({ ...formData, roomId: e.target.value })
              }
            />
            <label>Room Type</label>
            <input
              value={formData.roomType}
              onChange={(e) =>
                setFormData({ ...formData, roomType: e.target.value })
              }
            />
            <label>Price (₹)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
            <label>Image</label>
            <input
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="e.g., taj_deluxe.jpg"
            />
            <label>Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <label>Availability</label>
            <input
              value={formData.availability}
              onChange={(e) =>
                setFormData({ ...formData, availability: e.target.value })
              }
            />
            <label>Number of Rooms</label>
            <input
              type="number"
              value={formData.numberOfRooms}
              onChange={(e) =>
                setFormData({ ...formData, numberOfRooms: e.target.value })
              }
            />
            <div className="modal-actions">
              <button className="save-btn" onClick={handleAddRoomSave}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setAddingRoomHotel(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Edit Room Modal === */}
      {editingRoom && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Room {editingRoom.roomId}</h2>
            <label>Room Type</label>
            <input
              value={formData.roomType}
              onChange={(e) =>
                setFormData({ ...formData, roomType: e.target.value })
              }
            />
            <label>Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
            <label>Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <label>Availability</label>
            <input
              value={formData.availability}
              onChange={(e) =>
                setFormData({ ...formData, availability: e.target.value })
              }
            />
            <label>Rooms Left</label>
            <input
              type="number"
              value={formData.numberOfRooms}
              onChange={(e) =>
                setFormData({ ...formData, numberOfRooms: e.target.value })
              }
            />
            <div className="modal-actions">
              <button className="save-btn" onClick={handleRoomSave}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditingRoom(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Edit Hotel Modal === */}
      {editingHotel && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Hotel: {editingHotel.name}</h2>
            <label>Name</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <label>City</label>
            <input
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
            <label>Price (₹)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
            <label>Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <label>Amenities (comma-separated)</label>
            <input
              value={formData.amenities}
              onChange={(e) =>
                setFormData({ ...formData, amenities: e.target.value })
              }
            />
            <div className="modal-actions">
              <button onClick={handleSave} className="save-btn">
                Save
              </button>
              <button
                onClick={() => setEditingHotel(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
