import React from "react";

import HeroSection from "../components/HeroSection";
import HotelList from "../components/HotelList";
import PopularStays from "../components/PopularStays";


export default function Home() {
  return (
    <>
     
      <HeroSection />
    <HotelList />
      <PopularStays />
    </>
  );
}
