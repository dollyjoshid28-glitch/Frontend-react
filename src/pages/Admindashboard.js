import React, { useEffect, useState, useMemo } from "react";

// The Admin Dashboard now manages Hotels, Users, and the overall view state.

export default function AdminDashboard() {
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]); // State for user data
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("Summary"); // Initial view is Summary
  const [editingHotel, setEditingHotel] = useState(null);
  const [editingUser, setEditingUser] = useState(null); // State for editing users
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name"); // Default sort key
  const [addingHotel, setAddingHotel] = useState(false);
const [reportData, setReportData] = useState(null);

  const [formData, setFormData] = useState({
    name: "", city: "", price: "", description: "", amenities: "",
  });

  useEffect(() => {
    // Fetch all initial data needed for the summary
    Promise.all([fetchHotels(), fetchUsers()]).finally(() => setLoading(false));
  }, []);

  // --- Data Fetching Functions ---

  const fetchHotels = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5050/hotels");
      const data = await res.json();
      if (Array.isArray(data)) setHotels(data);
      return data;
    } catch (err) {
      console.error("Error fetching hotels:", err);
      return [];
    }
  };

  const fetchUsers = async () => {
    try {
      // NOTE: Assuming your backend has an endpoint to fetch all users
      const res = await fetch("http://127.0.0.1:5050/users"); 
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
      return data;
    } catch (err) {
      console.error("Error fetching users:", err);
      return [];
    }
  };

  const fetchReports = async () => {
  try {
    const res = await fetch("http://127.0.0.1:5050/admin-reports");
    const data = await res.json();
    if (data.success) setReportData(data);
  } catch (err) {
    console.error("Error fetching reports:", err);
  }
};


  // --- Filtering & Sorting Logic ---

  const filteredAndSortedHotels = useMemo(() => {
    let list = [...hotels];

    // 1. Filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      list = list.filter(hotel => 
        hotel.name.toLowerCase().includes(lowerCaseSearch) ||
        hotel.city.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // 2. Sort
    list.sort((a, b) => {
      const aVal = String(a[sortBy]).toLowerCase();
      const bVal = String(b[sortBy]).toLowerCase();
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    });

    return list;
  }, [hotels, searchTerm, sortBy]);
  
  const filteredAndSortedUsers = useMemo(() => {
    let list = [...users];

    // 1. Filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      list = list.filter(user => 
        user.name.toLowerCase().includes(lowerCaseSearch) ||
        user.email.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // 2. Sort
    list.sort((a, b) => {
      const aVal = String(a[sortBy]).toLowerCase();
      const bVal = String(b[sortBy]).toLowerCase();
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    });

    return list;
  }, [users, searchTerm, sortBy]);

  // --- CRUD Handlers (Hotels) ---

  const handleDeleteHotel = async (id) => {
  if (!window.confirm("Are you sure you want to delete this hotel?")) return;

  console.log("🧹 Deleting hotel:", id);
  try {
    const res = await fetch(`http://127.0.0.1:5050/delete-hotel/${id}`, {
      method: "DELETE",
    });

    // Handle non-JSON responses safely
    let data;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      console.warn("⚠️ Non-JSON response:", text);
      alert("Server error. Please check backend logs.");
      return;
    }

    if (res.ok && data.success) {
      alert("✅ Hotel deleted successfully!");
      await fetchHotels(); // Refresh
    } else {
      alert(data.message || "⚠️ Hotel not found or could not be deleted.");
    }
  } catch (err) {
    console.error("❌ Error deleting hotel:", err);
  }
};


  const handleEditHotel = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name || "", city: hotel.city || "", price: hotel.price || "",
      description: hotel.description || "",
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : hotel.amenities || "",
    });
  };

  const handleSaveHotel = async () => {
    if (!editingHotel) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:5050/update-hotel/${editingHotel._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            amenities: formData.amenities.split(",").map((a) => a.trim()).filter(Boolean),
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Hotel updated successfully!");
        setEditingHotel(null);
        fetchHotels(); // Re-fetch to ensure data integrity
      } else {
        alert(data.message || "Failed to update hotel");
      }
    } catch (err) {
      console.error("Error updating hotel:", err);
    }
  };

  // --- CRUD Handlers (Users) ---
  
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      // NOTE: Assuming your backend has a user delete endpoint
      const res = await fetch(`http://127.0.0.1:5050/delete-user/${id}`, { method: "DELETE" }); 
      const data = await res.json();
      if (data.success) {
        alert("User deleted successfully!");
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

const handleEditUser = (user) => {
  setEditingUser(user);
  setFormData({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
  });
};


  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      // NOTE: Assuming your backend has a user update endpoint
      const res = await fetch(
        `http://127.0.0.1:5050/update-user/${editingUser._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("User updated successfully!");
        setEditingUser(null);
        fetchUsers(); // Re-fetch users
      } else {
        alert(data.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const sortOptions = {
    hotels: [
      { value: 'name', label: 'Name' }, 
      { value: 'city', label: 'City' }, 
      { value: 'price', label: 'Price' }
    ],
    users: [
      { value: 'name', label: 'Name' }, 
      { value: 'email', label: 'Email' }, 
      { value: 'role', label: 'Role' }
    ],
  };

  // --- Render Functions ---

  const renderSummary = () => (
    <div style={summaryContainer}>
      <div style={summaryCard}>
        <h2 style={summaryTitle}>Total Hotels</h2>
        <p style={summaryCount}>{hotels.length}</p>
        <button style={btnView} onClick={() => setActiveView("Hotels")}>View Hotels</button>
      </div>
      <div style={summaryCard}>
        <h2 style={summaryTitle}>Total Users</h2>
        <p style={summaryCount}>{users.length}</p>
        <button style={btnView} onClick={() => setActiveView("Users")}>View Users</button>
      </div>
      <div style={summaryCard}>
        <h2 style={summaryTitle}>Reports (WIP)</h2>
        <p style={summaryCount}>Reports</p>
   <button 
  style={btnView} 
  onClick={() => { 
    setActiveView("Reports"); 
    fetchReports(); 
  }}
>
  View Reports
</button>

      </div>
    </div>
  );

const renderHotels = () => (
  <>
    <h2 style={subHeading}>All Hotels ({filteredAndSortedHotels.length})</h2>
    <div style={tableControls}>
      <input 
        style={searchInput} 
        type="text" 
        placeholder="Search by name, city, or owner..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)}
      />



      <button
  style={btnAdd}
  onClick={() => {
    setFormData({
      name: "",
      city: "",
      price: "",
      rating: "",
      description: "",
      amenities: "",
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      image: "",
    });
    setAddingHotel(true);
  }}
>
   Add Hotel
</button>





      <select 
        style={sortSelect} 
        value={sortBy} 
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="" disabled>Sort By</option>
        {sortOptions.hotels.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>

    {filteredAndSortedHotels.length === 0 && (
      <p style={noDataStyle}>No hotels found matching your search.</p>
    )}

    {/* Hotel Cards */}
    <div style={cardListWrapper}>
      {filteredAndSortedHotels.map((hotel) => {
        // Correct image path
        const imageSrc =
          hotel.image && hotel.image.trim() !== ""
            ? hotel.image.startsWith("http")
              ? hotel.image
            : `/images/${hotel.image}`

            : `https://picsum.photos/300/200?random=${hotel.hotelid}`;

        return (
          <div key={hotel._id} style={horizontalCardStyle}>
            
            {/* 🖼️ Image + Basic */}
            <div style={cardSectionLeft}>
              <img 
                src={imageSrc}
                alt={hotel.name}
                style={{ ...cardImageSmall, width: "90px", height: "90px", borderRadius: "8px" }}
              />
              <div style={textContainer}>
                <h2 style={{...cardTitle, fontSize: '1.2rem'}}>{hotel.name}</h2>
                <p style={cardSubtitle}>ID: {hotel.hotelid}</p>
              </div>
            </div>

            {/* 🏙️ City / Price / Rating */}
            <div style={{ flex: 2, padding: '0 15px' }}>
              <p style={cardDetailLabel}>City:</p>
              <p style={cardDetailValue}>{hotel.city}</p>

              <p style={cardDetailLabel}>Price:</p>
              <p style={cardDetailValue}>₹{hotel.price}</p>

              <p style={cardDetailLabel}>Rating:</p>
              <p style={cardDetailValue}>{hotel.rating || "—"}</p>
            </div>

            {/* 👤 Owner Info */}
            <div style={{ flex: 3, padding: '0 15px' }}>
              <p style={cardDetailLabel}>Owner Name:</p>
              <p style={cardDetailValue}>{hotel.owner?.name || "—"}</p>

              <p style={cardDetailLabel}>Owner Email:</p>
              <p style={cardDetailValue}>{hotel.owner?.email || "—"}</p>

              <p style={cardDetailLabel}>Owner Phone:</p>
              <p style={cardDetailValue}>{hotel.owner?.phone || "—"}</p>
            </div>

            {/* 📝 Description + Amenities */}
            <div style={{ flex: 3, padding: '0 15px' }}>
              <p style={cardDetailLabel}>Description:</p>
              <p style={cardDescriptionValue}>
                {hotel.description
                  ? hotel.description.substring(0, 100) + "..."
                  : "—"}
              </p>

              <p style={cardDetailLabel}>Amenities:</p>
              <p style={cardDescriptionValue}>
                {Array.isArray(hotel.amenities)
                  ? hotel.amenities.join(", ")
                  : hotel.amenities || "—"}
              </p>
            </div>

            {/* ⚙️ Actions */}
            <div style={cardSectionRight}>
              <button style={btnEdit} onClick={() => handleEditHotel(hotel)}>
                 Edit
              </button>
              <button style={btnDelete} onClick={() => handleDeleteHotel(hotel._id)}>
                 Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </>
);


const renderUsers = () => (
  <>
    <h2 style={subHeading}>All Users ({filteredAndSortedUsers.length})</h2>
    <div style={tableControls}>
      <input 
        style={searchInput} 
        type="text" 
        placeholder="Search by name or email..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)}
      />





      <select 
        style={sortSelect} 
        value={sortBy} 
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="" disabled>Sort By</option>
        {sortOptions.users.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>

    {filteredAndSortedUsers.length === 0 && (
      <p style={noDataStyle}>No users found matching your search.</p>
    )}

    {/* --- User List (Full Details) --- */}
    <div style={cardListWrapper}>
      {filteredAndSortedUsers.map((user) => (
        <div key={user._id} style={horizontalCardStyle}>
          
          {/* Left: Basic Info */}
          <div style={{...cardSectionLeft, flex: 3}}>
            <div style={textContainer}>
              <h2 style={{...cardTitle, fontSize: '1.2rem'}}>{user.name}</h2>
              <p style={{...cardSubtitle, color: primaryColor}}>{user.email}</p>
            </div>
          </div>

          {/* Middle: Full ID */}
          <div style={{ flex: 2, minWidth: '200px', padding: '0 10px' }}>
            <p style={cardDetailLabel}>User ID:</p>
            <p style={cardDetailValue}>{user._id}</p>
          </div>

          {/* Right: Phone + Role */}
          <div style={{ flex: 2, minWidth: '150px', padding: '0 10px' }}>
            <p style={cardDetailLabel}>Phone:</p>
            <p style={cardDetailValue}>{user.phone || "—"}</p>

           
          
          </div>

          {/* Actions */}
          <div style={cardSectionRight}>
            <button style={btnEdit} onClick={() => handleEditUser(user)}>
               Edit
            </button>
            <button style={btnDelete} onClick={() => handleDeleteUser(user._id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </>
);

  
const renderReports = () => {
  if (!reportData) {
    return <p style={loaderStyle}>Fetching analytics...</p>;
  }

  const { stats, latestUsers, mostBookedHotels, mostBookedRooms, newHotels, topRatedHotels } = reportData;

  return (
    <div style={reportBox}>
      <h2 style={reportMainTitle}>📊 Admin Analytics Report</h2>

      {/* --- Summary Stats --- */}
      <div style={summaryContainer}>
        <div style={summaryCard}>
          <h3 style={summaryTitle}>Total Users</h3>
          <p style={summaryCount}>{stats.usersCount}</p>
        </div>
        <div style={summaryCard}>
          <h3 style={summaryTitle}>Total Hotels</h3>
          <p style={summaryCount}>{stats.hotelsCount}</p>
        </div>
        <div style={summaryCard}>
          <h3 style={summaryTitle}>Total Bookings</h3>
          <p style={summaryCount}>{stats.bookingsCount}</p>
        </div>
      </div>

      {/* NOW THE GRID WRAPPER – PLACE ALL SECTIONS INSIDE THIS */}
      <div style={reportGrid}>

        {/* 1. Latest Users */}
        <section style={reportSectionCard}>
          <h3 style={reportSectionHeader}>🧍 Latest Users</h3>
          <div style={reportTableContainer}>
            <table style={reportTableStyle}>
              <thead>
                <tr style={reportTableHeaderRow}>
                  <th>Name</th><th>Email</th><th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {latestUsers.map((u, i) => (
                  <tr key={i} style={reportTableRowStyle}>
                    <td style={reportTableCellStyle}>{u.name}</td>
                    <td style={reportTableCellStyle}>{u.email}</td>
                    <td style={reportTableCellStyle}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Newly Added Hotels */}
        <section style={reportSectionCard}>
          <h3 style={reportSectionHeader}>🆕 Newly Added Hotels</h3>
          <ul style={reportListStyle}>
            {newHotels.map((h, i) => (
              <li key={i} style={reportListItemStyle}>
                <strong style={{ color: primaryColor }}>{h.name}</strong> — {h.city}
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Most Booked Hotels */}
        <section style={reportSectionCard}>
          <h3 style={reportSectionHeader}>🏨 Most Booked Hotels</h3>
          <ul style={reportListStyle}>
            {mostBookedHotels.map((h, i) => (
              <li key={i} style={reportListItemStyle}>
                {h._id} — <strong style={{ color: successColor }}>{h.totalBookings}</strong> bookings
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Top Room Types */}
        <section style={reportSectionCard}>
          <h3 style={reportSectionHeader}>🛏️ Top Room Types</h3>
          <ul style={reportListStyle}>
            {mostBookedRooms.map((r, i) => (
              <li key={i} style={reportListItemStyle}>
                {r._id} — <strong style={{ color: successColor }}>{r.totalBookings}</strong> bookings
              </li>
            ))}
          </ul>
        </section>

        {/* 5. Highest Rated Hotels */}
        <section style={reportSectionCard}>
          <h3 style={reportSectionHeader}>⭐ Highest Rated Hotels</h3>
          <ul style={reportListStyle}>
            {topRatedHotels.map((h, i) => (
              <li key={i} style={reportListItemStyle}>
                {h.name} (<strong style={{ color: successColor }}>{h.rating}</strong>/5)
              </li>
            ))}
          </ul>
        </section>

      </div> {/* END reportGrid */}

    </div>
  );
};



  // --- Main Render ---

  let content;
  switch (activeView) {
    case "Hotels":
      content = renderHotels();
      break;
    case "Users":
      content = renderUsers();
      break;
    case "Reports":
      content = renderReports();
      break;
    case "Summary":
    default:
      content = renderSummary();
      break;
  }

  if (loading) return <p style={loaderStyle}>Loading initial data...</p>;

  return (
    <div style={container}>
      <h1 style={heading}> Admin Dashboard</h1>

      {/* Navigation Buttons (Tab Bar) */}
      <div style={navBar}>
        <button 
          style={{...navButton, ...(activeView === 'Summary' ? navButtonActive : {})}} 
          onClick={() => { setActiveView("Summary"); setSearchTerm(""); setSortBy("name"); }}
        >
          Overview
        </button>
        <button 
          style={{...navButton, ...(activeView === 'Hotels' ? navButtonActive : {})}} 
          onClick={() => { setActiveView("Hotels"); setSearchTerm(""); setSortBy("name"); }}
        >
          Hotels
        </button>
        <button 
          style={{...navButton, ...(activeView === 'Users' ? navButtonActive : {})}} 
          onClick={() => { setActiveView("Users"); setSearchTerm(""); setSortBy("name"); }}
        >
          Users
        </button>
        <button 
          style={{...navButton, ...(activeView === 'Reports' ? navButtonActive : {})}} 
          onClick={() => { setActiveView("Reports"); setSearchTerm(""); setSortBy("name"); }}
        >
          Reports
        </button>
      </div>

      <div style={contentWrapper}>
        {content}
      </div>


      {/* === Hotel Edit Modal === */}
      {editingHotel && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ marginBottom: "15px", color: primaryColor }}>Edit Hotel: {editingHotel.name}</h2>
            
            <div style={inputGroup}><label style={modalLabel}>Name</label>
              <input style={modalInput} type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div style={inputGroup}><label style={modalLabel}>City</label>
              <input style={modalInput} type="text" name="city" value={formData.city} onChange={handleChange} />
            </div>
            <div style={inputGroup}><label style={modalLabel}>Price</label>
              <input style={modalInput} type="number" name="price" value={formData.price} onChange={handleChange} />
            </div>
            <div style={inputGroup}><label style={modalLabel}>Description</label>
              <textarea style={modalInput} name="description" rows="2" value={formData.description} onChange={handleChange} />
            </div>
            <div style={inputGroup}><label style={modalLabel}>Amenities (comma separated)</label>
              <input style={modalInput} type="text" name="amenities" value={formData.amenities} onChange={handleChange} />
            </div>

            <div style={modalButtons}>
              <button style={btnSave} onClick={handleSaveHotel}>
                 Save
              </button>
              <button style={btnCancel} onClick={() => setEditingHotel(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* === User Edit Modal === */}
      {editingUser && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ marginBottom: "15px", color: primaryColor }}>Edit User: {editingUser.name}</h2>
            
            <div style={inputGroup}><label style={modalLabel}>Name</label>
              <input style={modalInput} type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div style={inputGroup}><label style={modalLabel}>Email</label>
              <input style={modalInput} type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
         <div style={inputGroup}>
  <label style={modalLabel}>Phone</label>
  <input
    style={modalInput}
    type="text"
    name="phone"
    value={formData.phone}
    onChange={handleChange}
  />
</div>


            <div style={modalButtons}>
              <button style={btnSave} onClick={handleSaveUser}>
                 Save
              </button>
              <button style={btnCancel} onClick={() => setEditingUser(null)}>
                 Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* === Add Hotel Modal === */}
      {addingHotel && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ marginBottom: "15px", color: primaryColor }}>Add New Hotel</h2>

            <div style={inputGroup}><label style={modalLabel}>Hotel Name</label>
              <input style={modalInput} type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter hotel name" />
            </div>

            <div style={inputGroup}><label style={modalLabel}>City</label>
              <input style={modalInput} type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" />
            </div>

            <div style={inputGroup}><label style={modalLabel}>Price</label>
              <input style={modalInput} type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Enter price" />
            </div>

            <div style={inputGroup}><label style={modalLabel}>Description</label>
              <textarea style={modalInput} name="description" rows="2" value={formData.description} onChange={handleChange} placeholder="Short description" />
            </div>

            <div style={inputGroup}><label style={modalLabel}>Amenities</label>
              <input style={modalInput} type="text" name="amenities" value={formData.amenities} onChange={handleChange} placeholder="WiFi, Pool, Gym..." />
            </div>

            <div style={inputGroup}><label style={modalLabel}>Image Filename</label>
              <input style={modalInput} type="text" name="image" value={formData.image} onChange={handleChange} placeholder="taj_hotel.jpg" />
            </div>

            <div style={inputGroup}><label style={modalLabel}>Owner Name</label>
              <input style={modalInput} type="text" name="ownerName" value={formData.ownerName || ""} onChange={handleChange} placeholder="Owner full name" />
            </div>

            <div style={inputGroup}><label style={modalLabel}>Owner Email</label>
              <input style={modalInput} type="email" name="ownerEmail" value={formData.ownerEmail || ""} onChange={handleChange} placeholder="owner@example.com" />
            </div>

            <div style={inputGroup}><label style={modalLabel}>Owner Phone</label>
              <input style={modalInput} type="text" name="ownerPhone" value={formData.ownerPhone || ""} onChange={handleChange} placeholder="9876543210" />
           
           <div style={inputGroup}>
  <label style={modalLabel}>Owner Password</label>
  <input
    style={modalInput}
    type="password"
    name="ownerPassword"
    value={formData.ownerPassword || ""}
    onChange={handleChange}
    placeholder="Set a password"
  />
</div>


            </div>

            <div style={modalButtons}>
              <button
                style={btnSave}
             onClick={async () => {
  try {
    const res = await fetch("http://127.0.0.1:5050/add-hotel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        city: formData.city,
        price: Number(formData.price),
        description: formData.description,
        amenities: formData.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        image: formData.image,
     owner: {
  name: formData.ownerName,
  email: formData.ownerEmail,
  phone: formData.ownerPhone,
  password: formData.ownerPassword, // ✅ Added this line
},

      }),
    });

    const data = await res.json();
    console.log("🟢 Add hotel response:", data); // 👈 check backend reply

    // Handle different success patterns
    if (data.success || data.insertedId || data.acknowledged) {
      alert("✅ Hotel added successfully!");
      setAddingHotel(false);
      await fetchHotels(); // Refresh hotel list
    } else {
      alert(data.message || "⚠️ Failed to add hotel");
    }
  } catch (err) {
    console.error("Error adding hotel:", err);
    alert("❌ Error adding hotel. Check console for details.");
  }
}}

              >
                Save
              </button>

              <button style={btnCancel} onClick={() => setAddingHotel(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🌟 UPDATED INLINE STYLES (COMBINED + CLEANED + MODERN UI) */

/* THEME COLORS */
const primaryColor = "#0d47a1";
const successColor = "#2e7d32";
const deleteColor = "#d32f2f";
const accentColor = "#1565c0";
const softBg = "#f4f7fb";

/* MAIN WRAPPER */
const container = {
  padding: "40px 30px",
  background: softBg,
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
  maxWidth: "1300px",
  margin: "0 auto",
};

/* HEADING */
const heading = {
  textAlign: "center",
  fontSize: "2.7rem",
  fontWeight: 800,
  color: primaryColor,
  marginBottom: "25px",
};

/* NAVIGATION */
const navBar = {
  display: "flex",
  justifyContent: "center",
  gap: "35px",
  borderBottom: "2px solid #d5deea",
  paddingBottom: "10px",
  marginBottom: "30px",
};

const navButton = {
  padding: "12px 20px",
  fontSize: "1.1rem",
  fontWeight: 600,
  background: "transparent",
  border: "none",
  borderBottom: "3px solid transparent",
  color: "#607d8b",
  cursor: "pointer",
  transition: "0.3s",
};

const navButtonActive = {
  color: primaryColor,
  borderBottom: `3px solid ${primaryColor}`,
};

/* SUB HEADING */
const subHeading = {
  fontSize: "1.7rem",
  fontWeight: 800,
  color: primaryColor,
  marginBottom: "22px",
  borderLeft: `5px solid ${accentColor}`,
  paddingLeft: "15px",
};

/* SUMMARY */
const summaryContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "30px",
  marginTop: "30px",
};

const summaryCard = {
  background: "#fff",
  padding: "28px",
  borderRadius: "14px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  textAlign: "center",
  border: "1px solid #d9e3f2",
};

const summaryTitle = {
  fontSize: "1.25rem",
  fontWeight: 700,
  color: primaryColor,
  marginBottom: "8px",
};

const summaryCount = {
  fontSize: "3.1rem",
  fontWeight: 900,
  color: primaryColor,
  background: "#e3f2fd",
  padding: "12px",
  borderRadius: "12px",
  marginBottom: "15px",
};

const btnView = {
  background: successColor,
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
};

/* CONTROLS (SEARCH + SORT) */
const tableControls = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  marginBottom: "25px",
};

const searchInput = {
  flexGrow: 1,
  padding: "12px 16px",
  border: "1px solid #c9d5e1",
  borderRadius: "6px",
  fontSize: "1rem",
  background: "#fff",
};

const sortSelect = {
  padding: "12px 16px",
  borderRadius: "6px",
  border: "1px solid #c9d5e1",
  background: "#fff",
  fontSize: "1rem",
};

const btnAdd = {
  padding: "10px 20px",
  background: accentColor,
  color: "#fff",
  borderRadius: "6px",
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
};

/* LIST CARD WRAPPER */
const cardListWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

/* CARD */
const horizontalCardStyle = {
  display: "flex",
  background: "#fff",
  borderRadius: "12px",
  padding: "18px 20px",
  gap: "20px",
  border: "1px solid #dbe2ec",
  boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
  alignItems: "center",
};

/* CARD SECTIONS */
const cardSectionLeft = {
  display: "flex",
  alignItems: "center",
  flex: 2,
  gap: "15px",
};

const cardSectionRight = {
  width: "130px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  justifyContent: "center",
};

/* IMAGE */
const cardImageSmall = {
  width: "95px",
  height: "95px",
  borderRadius: "10px",
  objectFit: "cover",
  border: "1px solid #cbd6e0",
};

const textContainer = {
  flexGrow: 1,
};

const cardTitle = {
  fontSize: "1.25rem",
  fontWeight: 700,
  color: primaryColor,
};

const cardSubtitle = {
  fontSize: "0.85rem",
  color: "#78909c",
};

const cardDetailLabel = {
  fontSize: "0.75rem",
  color: "#738aa1",
  textTransform: "uppercase",
  marginBottom: "3px",
};

const cardDetailValue = {
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "#374957",
  marginBottom: "10px",
};

/* BUTTONS */
const baseBtn = {
  padding: "9px 14px",
  borderRadius: "6px",
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  color: "#fff",
  fontSize: "0.85rem",
};

const btnEdit = { ...baseBtn, background: successColor };
const btnDelete = { ...baseBtn, background: deleteColor };
const btnSave = { ...baseBtn, background: successColor };
const btnCancel = { ...baseBtn, background: "#90a4ae" };

/* MODAL */
const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modalBox = {
  background: "#fff",
  padding: "30px",
  borderRadius: "14px",
  width: "480px",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "0 10px 35px rgba(0,0,0,0.25)",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "15px",
};

const modalLabel = {
  marginBottom: "6px",
  fontWeight: 700,
  color: primaryColor,
};

const modalInput = {
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #c5cfdd",
  fontSize: "1rem",
};

/* REPORT BOX */
const reportBox = {
  background: "#fff",
  padding: "35px",
  borderRadius: "16px",
  border: "1px solid #d3dceb",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
};

const reportMainTitle = {
  fontSize: "2.2rem",
  fontWeight: 900,
  color: primaryColor,
  marginBottom: "25px",
  paddingBottom: "12px",
  borderBottom: "3px solid #d0d7e5",
};

/* REPORT GRID */
const reportGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: "30px",
  marginTop: "25px",
};

/* REPORT CARDS */
const reportSectionCard = {
  background: "#fff",
  padding: "22px",
  borderRadius: "14px",
  border: "1px solid #dce4ef",
  boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
};

const reportSectionHeader = {
  fontSize: "1.25rem",
  fontWeight: 800,
  color: primaryColor,
  paddingBottom: "10px",
  borderBottom: "2px solid #bbdefb",
  marginBottom: "15px",
};

/* REPORT TABLE */
const reportTableContainer = {
  overflowX: "auto",
};

const reportTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const reportTableHeaderRow = {
  background: "#eef3f8",
  fontWeight: 700,
  color: primaryColor,
};

const reportTableRowStyle = {
  transition: "0.2s",
};

const reportTableCellStyle = {
  padding: "10px 6px",
  borderBottom: "1px solid #e0e6ed",
  color: "#374957",
  fontSize: "0.95rem",
};

/* REPORT LIST */
const reportListStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const reportListItemStyle = {
  padding: "10px 0",
  borderBottom: "1px solid #e0e6ed",
  fontSize: "0.95rem",
  color: "#374957",
  display: "flex",
  justifyContent: "space-between",
};
/* Missing Styles — Add These */

/* Loader */
const loaderStyle = {
  textAlign: "center",
  marginTop: "60px",
  color: primaryColor,
  fontSize: "1.4rem",
  fontWeight: 700,
};

/* No Data Text */
const noDataStyle = {
  textAlign: "center",
  padding: "30px",
  color: deleteColor,
  fontSize: "1.1rem",
  background: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

/* Wrapper for content inside pages */
const contentWrapper = {
  padding: "10px 0",
};

/* Description text inside hotel cards */
const cardDescriptionValue = {
  fontSize: "0.88rem",
  color: "#465665",
  lineHeight: "1.3",
};

/* Modal Buttons row */
const modalButtons = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "20px",
};
