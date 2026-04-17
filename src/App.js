import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HotelDetails from "./components/HotelDetails";
import CityHotels from "./pages/CityHotels";
import UserDashboard from "./pages/Userdashboard";
import AdminDashboard from "./pages/Admindashboard";
import OwnerDashboard from "./pages/Ownerdashboard";
import CommonNavbar from "./components/CommonNavbar";
import UserNavbar from "./components/UserNavbar";
import Footer from "./components/Footer";
import MyBookings from "./pages/MyBookings";
import OwnerNavbar from "./components/OwnerNavbar";
import AdminNavbar from "./components/AdminNavbar";
import UserProfile from "./pages/UserProfile";






/* ---------------- Layout (handles navbar/footer) ---------------- */
/* ---------------- Layout (handles navbar/footer) ---------------- */
function Layout({ children }) {
  const location = useLocation();
  const path = location.pathname;
  const [user, setUser] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // ✅ listen for logout / login (storage updates)
  React.useEffect(() => {
    const handleStorageChange = () => {
      try {
        const updatedUser = JSON.parse(localStorage.getItem("user"));
        setUser(updatedUser);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localUserChange", handleStorageChange); // custom event for same tab
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localUserChange", handleStorageChange);
    };
  }, []);

  const hideNavbar = path === "/login" || path === "/register";

  const renderNavbar = () => {
    if (!user) return <CommonNavbar />;

    const role = user.role?.toLowerCase();
    if (role === "admin") return <AdminNavbar />;
    if (role.includes("owner")) return <OwnerNavbar />;
    if (role === "user") return <UserNavbar />;
    return <CommonNavbar />;
  };

  return (
    <>
      {!hideNavbar && renderNavbar()}
      <div style={{ minHeight: "80vh" }}>{children}</div>
      {!hideNavbar && <Footer />}
    </>
  );
}


/* ---------------- All routes (must be inside Router) ---------------- */
function AppRoutes() {
  // central user state
  const [user, setUser] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  });

  const navigate = useNavigate();

  // normalized role (may be "")
  const role = (user?.role || localStorage.getItem("role") || "").toLowerCase();

  // central logout used by navbars. It clears state & storage first, then navigates.
  const handleLogout = React.useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    // small delay ensures React state updates before any route logic that depends on user/role
    window.dispatchEvent(new Event("localUserChange"));
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 50);
  }, [navigate]);

  const getDashboardPath = (r) => {
    if (r === "user") return "/user/dashboard";
    if (r === "owner" || r === "hotel owner") return "/owner/dashboard";
    if (r === "admin") return "/admin/dashboard";
    return "/";
  };

  return (
    <Layout key={role} user={user} onLogout={handleLogout}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/city/:city" element={<CityHotels />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />

        {/* Auth */}
        <Route
          path="/login"
          element={
            !user ? (
              // Login should call updateRole(userObj) after successful login
              <Login
                updateRole={(newUser) => {
                  // persist and update central state
                  const normalized = { ...newUser, role: (newUser.role || "").toLowerCase() };
                  localStorage.setItem("user", JSON.stringify(normalized));
                  localStorage.setItem("role", normalized.role);
                  setUser(normalized);
                  // Login.js already navigates to the dashboard; no need to auto-redirect here
                  window.dispatchEvent(new Event("localUserChange"));
                }}
              />
            ) : (
              <Navigate to={getDashboardPath(role)} replace />
            )
          }
        />

        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to={getDashboardPath(role)} replace />}
        />

        {/* User Dashboard */}
        <Route
          path="/user/dashboard"
          element={
            role === "user" ? (
              <UserDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to={getDashboardPath(role)} replace />
            )
          }
        />

     <Route
  path="/owner/dashboard"
  element={
    !user ? (
      <Navigate to="/login" replace />
    ) : role.includes("owner") ? (
      <OwnerDashboard onLogout={handleLogout} />
    ) : (
      <Navigate to={getDashboardPath(role)} replace />
    )
  }
/>


        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            role === "admin" ? (
              <AdminDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to={getDashboardPath(role)} replace />
            )
          }
        />

        {/* My Bookings - protected for user and matches your navbar Link */}
        <Route
          path="/bookings"
          element={role === "user" ? <MyBookings /> : <Navigate to="/login" replace />}
        />
<Route path="/profile" element={<UserProfile />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Layout>
  );
}
/* ---------------- Root App (provides Router) ---------------- */
export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
