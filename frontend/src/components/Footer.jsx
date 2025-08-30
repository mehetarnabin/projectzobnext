// src/components/Footer.jsx
import React from "react";
import { MdFacebook, MdOutlineMail, MdOutlineHelpOutline } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="bg-[#003893] text-gray-50 pt-10 pb-6 text-sm">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div>
            <h4 className="text-white font-semibold mb-4">JobNext</h4>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:underline">About us</a></li>
              <li><a href="/contact" className="hover:underline">Contact</a></li>
              <li><a href="/careers" className="hover:underline">Careers</a></li>
              <li><a href="/blog" className="hover:underline">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Job Seekers</h4>
            <ul className="space-y-2">
              <li><a href="/find-jobs" className="hover:underline">Find jobs</a></li>
              <li><a href="/upload-resume" className="hover:underline">Upload resume</a></li>
              <li><a href="/job-alerts" className="hover:underline">Job alerts</a></li>
              <li><a href="/resources" className="hover:underline">Resources</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Employers</h4>
            <ul className="space-y-2">
              <li><a href="/post-job" className="hover:underline">Post a job</a></li>
              <li><a href="/search-resumes" className="hover:underline">Search resumes</a></li>
              <li><a href="/pricing" className="hover:underline">Pricing</a></li>
              <li><a href="/employer-login" className="hover:underline">Employer login</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <MdOutlineHelpOutline size={18} />
                <a href="/help" className="hover:underline">Help Center</a>
              </li>
              <li className="flex items-center gap-2">
                <MdOutlineMail size={18} />
                <a href="mailto:support@jobnext.com" className="hover:underline">Email Us</a>
              </li>
              <li className="flex items-center gap-2">
                <MdFacebook size={18} />
                <a href="https://facebook.com/jobnext" target="_blank" rel="noopener noreferrer" className="hover:underline">Facebook</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-400 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white">©2025 JobNext. All rights reserved.</p>
          <ul className="flex gap-4 text-white">
            <li><a href="/privacy" className="hover:underline">Privacy</a></li>
            <li><a href="/terms" className="hover:underline">Terms</a></li>
            <li><a href="/sitemap" className="hover:underline">Sitemap</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
