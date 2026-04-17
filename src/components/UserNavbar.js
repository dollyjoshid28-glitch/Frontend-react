import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import "./Navbar.css";

export default function UserNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

const handleLogout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  setMenuOpen(false);
  window.dispatchEvent(new Event("storage")); // notify App.js
  navigate("/"); // ✅ redirect to Home
};



  return (
    <nav className="user-navbar">
      <div className="user-navbar-logo">
        <Link to="/">StayzeeHub.com</Link>
      </div>

      <div className="user-navbar-links">
        <Link to="/bookings">My Bookings</Link>

        <div className="user-profile" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="profile-circle">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        </div>

        {menuOpen && (
          <div className="profile-menu">
            <div className="menu-header">
              <User size={18} />
              <span>{user?.name || "Guest User"}</span>
            </div>
            <hr />
           <button
  className="menu-item"
  onClick={() => navigate("/profile")}
>
  <User size={16} /> My Profile
</button>

           <button className="menu-item logout" onClick={handleLogout}>
  <LogOut size={16} /> Logout
</button>

          </div>
        )}
      </div>
    </nav>
  );
}
