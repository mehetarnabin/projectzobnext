import React, { useState, useEffect } from "react";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import JobSearchForm from "../components/JobSearchForm";
import CategoryCard from "../components/CategoryCard";
import Slider from "../components/Slider";
import FeaturedJobs from "../components/FeaturedJobs";
import EmployerCard from "../components/EmployerCard";
import TabbedSection from "../components/TabbedSection";
import api from "../api/axios";

const HomePage = () => {
  const [categoriesWithCount, setCategoriesWithCount] = useState([]);
  const [featuredEmployers, setFeaturedEmployers] = useState([]);
  const [loadingEmployers, setLoadingEmployers] = useState(true);
  const [errorEmployers, setErrorEmployers] = useState(null);

  // Fetch categories with job counts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories-with-count");
        const cats = Array.isArray(res.data.categories) ? res.data.categories : [];
        setCategoriesWithCount(cats);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategoriesWithCount([]); // fallback
      }
    };
    fetchCategories();
  }, []);

  // Fetch featured employers
  useEffect(() => {
    const fetchFeaturedEmployers = async () => {
      try {
        const res = await api.get("/employers/featured");
        const employers = Array.isArray(res.data.employers) ? res.data.employers : [];
        setFeaturedEmployers(employers);
      } catch (err) {
        console.error(err);
        setErrorEmployers("Failed to load featured employers.");
        setFeaturedEmployers([]);
      } finally {
        setLoadingEmployers(false);
      }
    };
    fetchFeaturedEmployers();
  }, []);

  return (
    <main className="main overflow-visible">
      {/* Hero Search Section */}
      <section className="w-full bg-[#003893] text-white py-16">
        <div className="p-2 max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-7">Find Your Dream Job</h1>
          <JobSearchForm />
        </div>
      </section>

      <div className="section-container mt-6 p-6 max-w-7xl mx-auto overflow-visible">
        {/* Job Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Explore by category</h2>
          <div className="relative">
            <div className="-mx-6 px-6 overflow-visible">
              <Slider
                slides={Array.isArray(categoriesWithCount) ? categoriesWithCount : []}
                renderSlide={(cat) => (
                  <CategoryCard
                    key={cat.classification || Math.random()}
                    title={cat.classification || "Unknown"}
                    count={cat.count || 0}
                  />
                )}
                navigation={{ nextEl: ".category-swiper-next", prevEl: ".category-swiper-prev" }}
                slidesPerView={2}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                }}
              />
            </div>

            {/* Category Slider Arrows */}
            <div className="category-swiper-prev absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
              <MdArrowBackIos size={18} />
            </div>
            <div className="category-swiper-next absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
              <MdArrowForwardIos size={18} />
            </div>
          </div>
        </section>

        {/* Featured Jobs */}
        <FeaturedJobs />

        {/* Featured Employers */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Featured Employers</h2>
          {loadingEmployers ? (
            <p>Loading featured employers...</p>
          ) : errorEmployers ? (
            <p className="text-red-500">{errorEmployers}</p>
          ) : (
            <div className="relative">
              <div className="-mx-6 px-6 overflow-visible">
                <Slider
                  slides={Array.isArray(featuredEmployers) ? featuredEmployers : []}
                  renderSlide={(employer) => (
                    <EmployerCard
                      key={employer.companyName || Math.random()}
                      companyName={employer.companyName || "Unknown"}
                      logoUrl={employer.logoUrl || "/images/default-company-logo.png"}
                    />
                  )}
                  navigation={{ nextEl: ".employer-swiper-next", prevEl: ".employer-swiper-prev" }}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 5 },
                  }}
                />
              </div>

              {/* Employer Slider Arrows */}
              <div className="employer-swiper-prev absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
                <MdArrowBackIos size={18} />
              </div>
              <div className="employer-swiper-next absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
                <MdArrowForwardIos size={18} />
              </div>
            </div>
          )}
        </section>

        {/* Trending Jobs Tabbed Section */}
        <TabbedSection
          title="Discover Trending Jobs"
          tabs={[
            {
              label: "Popular Searches",
              items: ["IT jobs", "Remote jobs", "Part-time jobs", "Marketing jobs", "Driver jobs", "Teaching jobs"],
            },
            {
              label: "Popular Companies",
              items: ["Nepal Telecom", "Daraz", "Ncell", "Fusemachines", "CloudFactory", "Leapfrog"],
            },
            {
              label: "Popular Jobs",
              items: ["Software Engineer", "Accountant", "Civil Engineer", "Delivery Rider", "Data Analyst", "Call Center Agent"],
            },
            {
              label: "Popular Location",
              items: ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan", "Biratnagar", "Butwal"],
            },
          ]}
        />
      </div>
    </main>
  );
};

export default HomePage;
