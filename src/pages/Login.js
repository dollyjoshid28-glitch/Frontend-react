import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
export default function Login({ onSwitchToRegister, updateRole }) {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // ✅ fixed name (was setRoleSelect)
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      const response = await fetch("https://backend-hotel-25mu.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password, role }),
      });

      const data = await response.json();

    if (data.success) {
  setMessage("✅ Login successful!");
  setEmail("");
  setPassword("");

  const userInfo = data.user || {};

  // ✅ Normalize role (handle "Hotel Owner", "hotel owner", "Owner")
  const normalizedRole = (userInfo.role || "user").toLowerCase().trim();
  const cleanRole = normalizedRole.includes("owner")
    ? "owner"
    : normalizedRole;

  const normalizedUser = { ...userInfo, role: cleanRole };

  // ✅ Save normalized user in localStorage
  localStorage.setItem("user", JSON.stringify(normalizedUser));
  localStorage.setItem("role", cleanRole);

  // ✅ Trigger custom event for same-tab updates (navbar + routes)
  window.dispatchEvent(new Event("localUserChange"));

  // ✅ Update App.js user state
  if (updateRole) updateRole(normalizedUser);

  console.log("Redirecting as role:", cleanRole);

  // ✅ Navigate to correct dashboard
  if (cleanRole === "admin") navigate("/admin/dashboard");
  else if (cleanRole === "owner") navigate("/owner/dashboard");
  else navigate("/user/dashboard");



      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("⚠️ Server not responding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        padding: "30px",
        borderRadius: "20px",
        backgroundColor: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        fontFamily: "'Poppins', sans-serif",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        Login
      </h2>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
        {/* Email */}
        <label style={{ marginBottom: "5px", color: "#555", fontSize: "14px", fontWeight: 600 }}>
          Email Address
        </label>
        <div style={{ position: "relative", marginBottom: "15px" }}>
          <span
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#667eea",
            }}
          >
            ✉️
          </span>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 12px 10px 35px",
              borderRadius: "10px",
              border: "2px solid #e0e0e0",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Password */}
        <label style={{ marginBottom: "5px", color: "#555", fontSize: "14px", fontWeight: 600 }}>
          Password
        </label>
        <div style={{ position: "relative", marginBottom: "15px" }}>
          <span
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#667eea",
            }}
          >
            🔒
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 35px 10px 35px",
              borderRadius: "10px",
              border: "2px solid #e0e0e0",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#667eea",
              fontSize: "16px",
            }}
          >
           {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>







        {/* Role selection */}
        <label style={{ marginBottom: "5px", color: "#555", fontSize: "14px", fontWeight: 600 }}>
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)} // ✅ fixed here too
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: "2px solid #e0e0e0",
            marginBottom: "20px",
            fontSize: "15px",
            outline: "none",
          }}
        >
          <option value="user">User</option>
          <option value="owner">Hotel Owner</option>
          <option value="admin">Admin</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#1e3a8a",
            color: "#fff",
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            marginBottom: "10px",
          }}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && (
        <div
          style={{
            textAlign: "center",
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
            color: message.startsWith("✅") ? "#155724" : "#721c24",
            marginBottom: "10px",
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: "14px", color: "#555" }}>
        Don't have an account?{" "}
        <span
          onClick={() => {
            if (onSwitchToRegister) onSwitchToRegister();
          }}
          style={{ color: "#1e3a8a", cursor: "pointer", fontWeight: 600 }}
        >
          Register here
        </span>
      </p>
    </div>
  );
}
