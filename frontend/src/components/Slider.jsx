import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules"; // Keep this import
import "swiper/css";
import "swiper/css/navigation"; // Make sure these are imported
import "swiper/css/pagination";

const Slider = ({
  slides = [],
  renderSlide,
  navigation = {}, // This is correct now, as you pass the object from HomePage
  slidesPerView = 1,
  spaceBetween = 20,
  breakpoints = {},
  loop = false,
  className = "",
  renderExternalPagination = false, // Not used in your current setup, but harmless
}) => {
  return (
    <div className="relative">
      <Swiper
        modules={[Navigation]} // <--- CHANGE THIS: Navigation must be in an array
        navigation={navigation} // This correctly receives the { nextEl: ".selector", prevEl: ".selector" } object
        loop={loop}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        breakpoints={breakpoints}
        className={`relative ${className}`}
      >
        {slides.map((item, index) => (
          <SwiperSlide key={item.id || index}>
            {renderSlide ? renderSlide(item, index) : null}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;