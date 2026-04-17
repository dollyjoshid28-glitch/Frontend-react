
import React from "react";
import Navbar from "./Navbar";
import UserNavbar from "./UserNavbar";

export default function CommonNavbar() {
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  return isLoggedIn ? <UserNavbar /> : <Navbar />;
}
