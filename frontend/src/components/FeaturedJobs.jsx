// src/components/FeaturedJobs.jsx
import React from "react";
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import Slider from "./Slider"; // Assuming Slider is in the same components directory
import JobCard from "./JobCard"; // This is the component we modified

const FeaturedJobs = () => {
  const staticFeaturedJobs = [
    { id: 1, title: "Senior Software Engineer", company: "Innovate Solutions", location: "San Francisco, CA", description: "Seeking a highly experienced software engineer for our core team. This role involves developing scalable applications, contributing to architectural decisions, and mentoring junior team members. Strong proficiency in React and Node.js is required. Experience with cloud platforms like AWS or Azure is a plus." },
    { id: 2, title: "Marketing Specialist", company: "Creative Brand Co.", location: "New York, NY", description: "Help us craft compelling marketing campaigns across various digital channels. You will be responsible for content creation, SEO optimization, social media management, and performance analytics. A creative mindset and strong communication skills are essential for this role." },
    { id: 3, title: "Data Analyst", company: "Data Insights Inc.", location: "Austin, TX", description: "Analyze large datasets to provide actionable insights. This position requires strong analytical skills, proficiency in SQL and Python (or R), and experience with data visualization tools like Tableau or Power BI. You will work closely with business stakeholders to understand their data needs." },
    { id: 4, title: "UX Designer", company: "UserFirst Designs", location: "Seattle, WA", description: "Design intuitive and user-friendly interfaces. We are looking for someone with a strong portfolio showcasing user-centered design principles, wireframing, prototyping, and user testing. Experience with Figma or Sketch is a must. You will collaborate closely with product managers and engineers." },
    { id: 5, title: "Project Manager", company: "Global Projects Ltd.", location: "London, UK", description: "Lead complex projects from conception to completion. This role demands excellent organizational skills, the ability to manage cross-functional teams, and a proven track record of delivering projects on time and within budget. PMP certification is preferred but not required. You will be responsible for stakeholder communication and risk management." },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold mb-6">Featured Jobs</h2>
      <div className="relative">
        <div className="-mx-6 px-6 overflow-visible">
          <Slider
            slides={staticFeaturedJobs}
            renderSlide={(job) => (
              <JobCard
                key={job.id}
                title={job.title}
                company={job.company}
                location={job.location}
                description={job.description}
              />
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
        </div>

        {/* CUSTOM NAV BUTTONS absolutely placed OUTSIDE inner wrapper */}
        <div className="featured-job-swiper-prev absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
          <MdArrowBackIos size={18} />
        </div>
        <div className="featured-job-swiper-next absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center cursor-pointer text-[#003893] hover:bg-[#003893] hover:text-white transition">
          <MdArrowForwardIos size={18} />
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;