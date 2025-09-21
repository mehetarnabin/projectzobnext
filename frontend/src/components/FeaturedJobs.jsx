import React, { useEffect, useState } from "react";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import Slider from "./Slider";
import JobCard from "./JobCard";
import api from "../api/axios";

const FeaturedJobs = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await api.get("/jobs/featured"); // 🔹 use featured route
        const jobsArray = Array.isArray(response.data.jobs) ? response.data.jobs : [];
        setFeaturedJobs(jobsArray);

        if (jobsArray.length === 0) {
          console.warn("No featured jobs returned from API");
        }
      } catch (err) {
        console.error("Error fetching featured jobs:", err);
        setError("Failed to load featured jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);


  return (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold mb-6">Featured Jobs</h2>

      {loading ? (
        <p>Loading jobs...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : featuredJobs.length === 0 ? (
        <p>No jobs available at the moment.</p>
      ) : (
        <div className="relative -mx-6 px-6 overflow-visible">
          <Slider
            slides={featuredJobs}
            renderSlide={(job) => (
              <div className="relative" key={job.id}>
                <span className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-semibold px-2 py-1 rounded z-10">
                  Featured
                </span>
                <JobCard
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  description={job.description}
                />
              </div>
            )}
            navigation={{
              nextEl: ".featured-job-swiper-next",
              prevEl: ".featured-job-swiper-prev",
            }}
            paginationClassName="featured-job-swiper-pagination"
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          />

          {/* Navigation Buttons */}
          <div className="featured-job-swiper-prev absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
            <MdArrowBackIos size={18} />
          </div>
          <div className="featured-job-swiper-next absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
            <MdArrowForwardIos size={18} />
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedJobs;
