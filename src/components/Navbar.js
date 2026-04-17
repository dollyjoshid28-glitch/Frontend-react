import React, { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

import RegisterModal from "./RegisterModal";
import LoginModal from "./LoginModal"; // import the login modal

export default function Navbar() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">StayzeeHub.com</Link>
        </div>


        <div className="navbar-links">
   
<Link to="/city/Goa">
  <button className="login-btn">Hotels</button>
</Link>




          {/* Login button opens modal */}
          <button
            className="login-btn"
            onClick={() => setIsLoginOpen(true)}
          >
            Login
          </button>

          {/* Register button opens modal */}
          <button
            className="register-btn"
            onClick={() => setIsRegisterOpen(true)}
          >
            Register
          </button>

        
        </div>
      </nav>

      {/* Modals */}
    <LoginModal
  isOpen={isLoginOpen}
  onClose={() => setIsLoginOpen(false)}
  onSwitchToRegister={() => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  }}
/>

<RegisterModal
  isOpen={isRegisterOpen}
  onClose={() => setIsRegisterOpen(false)}
  onRegisterSuccess={() => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  }}
  onSwitchToLogin={() => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  }}
/>


    </>
  );
}
