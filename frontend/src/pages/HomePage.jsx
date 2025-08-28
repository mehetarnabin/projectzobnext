import API_BASE_URL from "../config"; // Add this line
import React from "react";
import { useState, useEffect } from "react";
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import JobSearchForm from "../components/JobSearchForm";
import CategoryCard from "../components/CategoryCard";
import JobCard from "../components/JobCard";
import EmployerCard from "../components/EmployerCard";
import Slider from "../components/Slider";
import TabbedSection from "../components/TabbedSection";
import FeaturedJobs from "../components/FeaturedJobs";

const HomePage = () => {
  const [latestJobs, setLatestJobs] = useState([]);

  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs`); // Your API endpoint for fetching all jobs
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLatestJobs(data);
      } catch (error) {
        console.error("Error fetching latest jobs:", error);
      }
    };

    fetchLatestJobs();
  }, []); // Empty dependency array means this runs once on component mount

  const featuredEmployers = [
    {
      companyName: "Google",
      tagline: "Organizing the world’s information",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    },
    {
      companyName: "Microsoft",
      tagline: "Empowering every person on the planet",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    },
    {
      companyName: "Amazon",
      tagline: "From A to Z",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    },
    {
      companyName: "Android",
      tagline: "Connecting World",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Android_logo_%282019-2023%29.svg",
    },
    {
      companyName: "Intel",
      tagline: "Intel company",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Intel_logo_%282020%2C_light_blue%29.svg",
    },
    {
      companyName: "Lenovo",
      tagline: "Lenovo company",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg",
    },
    {
      companyName: "Rolex",
      tagline: "Rolex company",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Logo_da_Rolex.png",
    },
  ];
  return (
    <main className="main overflow-visible">
      {/* Hero Search Section */}
      <section className="w-full bg-[#003893] transition-all duration-200 text-white py-16">
        <div className="p-2 max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-7">Find Your Dream Job</h1>
          <JobSearchForm />
        </div>
      </section>

      <div className="section-container mt-6 p-6 max-w-7xl mx-auto overflow-visible">
        {/* Main Content (inside new container) */}
        <div className="container mx-auto overflow-visible">
          {/* Job Categories */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Explore by category</h2>
            <div className="relative">
              <div className="-mx-6 px-6 overflow-visible">
              <Slider
                slides={["IT", "Healthcare", "Construction", "Education", "Finance", "Marketing"]}
                renderSlide={(cat) => <CategoryCard title={cat} />}
                navigation={{
                  nextEl: ".category-swiper-next",
                  prevEl: ".category-swiper-prev",
                }}
                paginationClassName="category-swiper-pagination"
                slidesPerView={2}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                }}
              />    
              </div>
              {/* Custom Navigation Buttons */}
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

          {/* Latest Jobs Section (Cloned from Featured Jobs) */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Latest Jobs</h2>
            <div className="relative">
              <div className="-mx-6 px-6 overflow-visible">
                <Slider
                  slides={latestJobs} // Use the fetched latestJobs data
                  renderSlide={(job) => (
                    <JobCard
                      key={job.id} // Important for React list rendering
                      title={job.title}
                      company={job.company}
                      location={job.location}
                      description={job.description}
                      // Pass other job details as props to JobCard if needed
                    />
                  )}
                  navigation={{
                    nextEl: ".latest-job-swiper-next", // Use distinct class names for navigation
                    prevEl: ".latest-job-swiper-prev",
                  }}
                  paginationClassName="latest-job-swiper-pagination" // Use distinct class name for pagination
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                />
              </div>

              {/* CUSTOM NAV BUTTONS absolutely placed OUTSIDE inner wrapper */}
              <div className="latest-job-swiper-prev absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
                <MdArrowBackIos size={18} />
              </div>
              <div className="latest-job-swiper-next absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
                <MdArrowForwardIos size={18} />
              </div>
            </div>
          </section>

          {/* Featured Employers */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Featured Employers</h2>
            <div className="relative">
              <div className="-mx-6 px-6 overflow-visible">
              <Slider
                slides={featuredEmployers}
                renderSlide={(employer) => (
                  <EmployerCard
                    companyName={employer.companyName}
                    tagline={employer.tagline}
                    logoUrl={employer.logoUrl}
                  />
                )}
                navigation={{
                  nextEl: ".employer-swiper-next",
                  prevEl: ".employer-swiper-prev",
                }}
                paginationClassName="employer-swiper-pagination"
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 5 },
                }}
              />
              </div>
              <div className="employer-swiper-prev absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
                <MdArrowBackIos size={18} />
              </div>
              <div className="employer-swiper-next absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
                <MdArrowForwardIos size={18} />
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button className="flex items-center text-[#003893] border-2 border-[#003893] px-6 py-2 rounded hover:bg-[#003893] hover:text-white transition">
                See More <span className="ml-2">➔</span>
              </button>
            </div>
          </section>

          <TabbedSection
            title="Discover Trending Jobs"
            tabs={[
              {
                label: "Popular Searches",
                items: [
                  "IT jobs",
                  "Remote jobs",
                  "Part-time jobs",
                  "Marketing jobs",
                  "Driver jobs",
                  "Teaching jobs",
                  "IT jobs",
                  "Remote jobs",
                  "Part-time jobs",
                  "Marketing jobs",
                  "Driver jobs",
                  "Teaching jobs",
                  "IT jobs",
                  "Remote jobs",
                  "Part-time jobs",
                  "Marketing jobs",
                  "Driver jobs",
                  "Teaching jobs",
                  "IT jobs",
                  "Remote jobs",
                  "Part-time jobs",
                  "Marketing jobs",
                  "Driver jobs",
                  "Teaching jobs",
                ],
              },
              {
                label: "Popular Companies",
                items: [
                  "Nepal Telecom",
                  "Daraz",
                  "Ncell",
                  "Fusemachines",
                  "CloudFactory",
                  "Leapfrog",
                  "Nepal Telecom",
                  "Daraz",
                  "Ncell",
                  "Fusemachines",
                  "CloudFactory",
                  "Leapfrog",
                  "Nepal Telecom",
                  "Daraz",
                  "Ncell",
                  "Fusemachines",
                  "CloudFactory",
                  "Leapfrog",
                  "Nepal Telecom",
                  "Daraz",
                  "Ncell",
                  "Fusemachines",
                  "CloudFactory",
                  "Leapfrog",
                ],
              },
              {
                label: "Popular Jobs",
                items: [
                  "Software Engineer",
                  "Accountant",
                  "Civil Engineer",
                  "Delivery Rider",
                  "Data Analyst",
                  "Call Center Agent",
                  "Software Engineer",
                  "Accountant",
                  "Civil Engineer",
                  "Delivery Rider",
                  "Data Analyst",
                  "Call Center Agent",
                  "Software Engineer",
                  "Accountant",
                  "Civil Engineer",
                  "Delivery Rider",
                  "Data Analyst",
                  "Call Center Agent",
                  "Software Engineer",
                  "Accountant",
                  "Civil Engineer",
                  "Delivery Rider",
                  "Data Analyst",
                  "Call Center Agent",  
                ],
              },
              {
                label: "Popular Location",
                items: [
                  "Kathmandu",
                  "Lalitpur",
                  "Bhaktapur",
                  "Pokhara",
                  "Chitwan",
                  "Biratnagar",
                  "Butwal",
                  "Kathmandu",
                  "Lalitpur",
                  "Bhaktapur",
                  "Pokhara",
                  "Chitwan",
                  "Biratnagar",
                  "Butwal",
                  "Kathmandu",
                  "Lalitpur",
                  "Bhaktapur",
                  "Pokhara",
                  "Chitwan",
                  "Biratnagar",
                  "Butwal",
                  "Kathmandu",
                  "Lalitpur",
                  "Bhaktapur",
                  "Pokhara",
                  "Chitwan",
                  "Biratnagar",
                  "Butwal",  
                ],
              },
            ]}
          />
        </div>
      </div>
    </main>
  );
};

export default HomePage;
