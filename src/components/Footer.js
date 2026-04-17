import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <h2 className="footer-logo">StayzeeHub.com</h2>
        <p className="footer-about">
          StayzeeHub.com is your trusted travel companion — connecting you with handpicked hotels,
          seamless bookings, and unforgettable stays across India and beyond.
        </p>
      </div>

      <div className="footer-links-container">
        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About us</a></li>
            <li><a href="/jobs">Jobs</a></li>
            <li><a href="/list-property">List your property</a></li>
            <li><a href="/partners">Partnerships</a></li>
            <li><a href="/newsroom">Newsroom</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>
          <ul>
            <li><a href="/travel-guide">India travel guide</a></li>
            <li><a href="/hotels">Hotels in India</a></li>
            <li><a href="/holiday-rentals">Holiday rentals</a></li>
            <li><a href="/packages">Holiday packages</a></li>
            <li><a href="/flights">Domestic flights</a></li>
            <li><a href="/car-hire">Car hire</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Policies</h4>
          <ul>
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/cookies">Cookies</a></li>
            <li><a href="/terms">Terms of use</a></li>
            <li><a href="/content-guidelines">Content guidelines</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Help</h4>
          <ul>
            <li><a href="/support">Support</a></li>
            <li><a href="/cancel">Change or cancel booking</a></li>
            <li><a href="/refund">Refund process</a></li>
            <li><a href="/flight-booking">Book a flight</a></li>
            <li><a href="/documents">Travel documents</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} StayzeeHub.com. All rights reserved.</p>
      </div>
    </footer>
  );
}
