import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register({ onRegisterSuccess, onSwitchToLogin }) 

 {
 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setMessage("");

  try {
    const response = await fetch("https://backend-hotel-25mu.onrender.com/register"
, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const data = await response.json();

    if (data.success) {
      setMessage("✅ Registration successful! Redirecting to login...");
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");

      // Redirect to login after 1.5 seconds
    setTimeout(() => {
  if (onRegisterSuccess) onRegisterSuccess();
}, 1500);


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
        maxWidth: "400px",
        padding: "30px",
        borderRadius: "20px",
        backgroundColor: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        fontFamily: "'Poppins', sans-serif",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        Create Account
      </h2>
      <p style={{ textAlign: "center", marginBottom: "25px", color: "#666", fontSize: "14px" }}>
        Create your account and start exploring amazing stays!
      </p>

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column" }}>
        {/* Full Name */}
        <label style={{ marginBottom: "5px", color: "#555", fontSize: "14px", fontWeight: 600 }}>
          Full Name
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
            👤
          </span>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        {/* Phone */}
        <label style={{ marginBottom: "5px", color: "#555", fontSize: "14px", fontWeight: 600 }}>
          Phone Number
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
            📞
          </span>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
        <div style={{ position: "relative", marginBottom: "20px" }}>
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
            placeholder="Create a strong password"
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
          {isLoading ? "Registering..." : "Register"}
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
        Already have an account?{" "}
      <span
  onClick={() => {
    if (onSwitchToLogin) onSwitchToLogin();
  }}
  style={{ color: "#1e3a8a", cursor: "pointer", fontWeight: 600 }}
>
  Log in here
</span>

      </p>
    </div>
  );
}
