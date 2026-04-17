import React, { useEffect, useState } from "react";
import "./UserProfile.css";
import { Link} from "react-router-dom";




// Safe JSON parse
const getUserSafe = () => {
  try {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
};

export default function UserProfile() {
  const savedUser = getUserSafe() || {};
const [activeTab, setActiveTab] = useState("profile");
  // All React Hooks MUST be at the top
  const [user, setUser] = useState(savedUser);

  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    cancelled: 0,
  });

  const [recent, setRecent] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: savedUser?.name || "",
    email: savedUser?.email || "",
    phone: savedUser?.phone || "",
  });

  // ⭐⭐⭐ UPDATED useEffect — FIXED STATS ISSUE ⭐⭐⭐
  useEffect(() => {
    if (!user?._id) return;

    fetch("http://127.0.0.1:5050/user-bookings/" + user._id)
      .then((res) => res.json())
      .then((data) => {
        console.log("📌 user-bookings response:", data); // Debug

        if (!data.success) return;

        // Set recent bookings
        if (Array.isArray(data.recent)) {
          setRecent(data.recent);
        }

        // If backend sends stats, use them
        if (data.stats) {
          setStats({
            total: Number(data.stats.total ?? 0),
            upcoming: Number(data.stats.upcoming ?? 0),
            cancelled: Number(data.stats.cancelled ?? 0),
          });
        } else {
          // Otherwise compute stats manually
          const computed = computeStatsFromRecent(data.recent || []);
          setStats(computed);
        }
      })
      .catch((err) => console.log("Stats fetch error:", err));
  }, [user?._id]);

  // Helper function
  function computeStatsFromRecent(recentArr) {
    let total = recentArr.length;
    let upcoming = 0;
    let cancelled = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    recentArr.forEach((b) => {
      const status = (b.status || "").toLowerCase();
      const checkInDate = new Date(b.checkIn);

      if (status.includes("cancel")) {
        cancelled++;
      } else if (checkInDate >= today) {
        upcoming++;
      }
    });

    return { total, upcoming, cancelled };
  }

  // ⭐ UPDATED handleSave – frontend-only update, no backend change needed
  const handleSave = async () => {
    const res = await fetch("http://127.0.0.1:5050/update-user/" + user._id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      const updatedUser = {
        ...user,
        name: form.name,
        email: form.email,
        phone: form.phone,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);

      setModalOpen(false);
      alert("Profile Updated!");
    }
  };

  // SHOW this after hooks (safe)
  if (!user?._id) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Please login to view your profile.</h2>
      </div>
    );
  }

  return (
    <div className="profile-layout">

      {/* LEFT SIDEBAR */}
      <div className="sidebar">
        <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>

        <h3>{user?.name}</h3>
       
      <button
  className={`side-btn ${activeTab === "profile" ? "active" : ""}`}
  onClick={() => setActiveTab("profile")}
>
  My Profile
</button>

<button
  className={`side-btn ${activeTab === "bookings" ? "active" : ""}`}
  onClick={() => setActiveTab("bookings")}
>
    <Link to="/bookings">My Bookings</Link>
</button>

<button
  className="side-btn"
  onClick={() => setModalOpen(true)}
>
  Edit Profile
</button>

      </div>

      {/* RIGHT CONTENT */}
      <div className="content">

        {/* PROFILE CARD */}
        <div className="card">
          <h3>My Profile</h3>
          <p><b>Name:</b> {user?.name}</p>
          <p><b>Email:</b> {user?.email}</p>
        
        </div>

        {/* BOOKING STATS */}
        <div className="card stats-card">
          <h3>Booking Stats</h3>

          <div className="stats-grid">
            <div className="stat-box">
              <h2>{stats.total}</h2>
              <p>Total Bookings</p>
            </div>

            <div className="stat-box">
              <h2>{stats.upcoming}</h2>
              <p>Upcoming</p>
            </div>

            <div className="stat-box">
              <h2>{stats.cancelled}</h2>
              <p>Cancelled</p>
            </div>
          </div>
        </div>

        {/* RECENT BOOKINGS */}
        <div className="card">
          <h3>Recent Bookings</h3>

          <table className="recent-table">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recent.map((b) => (
                <tr key={b._id}>
                  <td>{b.hotelName}</td>
                  <td>{b.roomType}</td>
                  <td>{b.checkIn}</td>
                  <td className="green">Confirmed</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit Profile</h3>

            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label>Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />



            <button className="save-btn" onClick={handleSave}>Save</button>
            <button className="cancel-btn" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
