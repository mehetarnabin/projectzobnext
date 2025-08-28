import React from "react";

const SocialLinks = () => {
  return (
    <section className="bg-white inset-shadow-md rounded-2xl p-4">
      <h3 className="text-lg font-semibold mb-2">Social Media</h3>
      <ul className="text-sm space-y-1 text-blue-600">
        <li><a href="#" className="hover:underline">LinkedIn</a></li>
        <li><a href="#" className="hover:underline">GitHub</a></li>
        <li><a href="#" className="hover:underline">Portfolio Website</a></li>
      </ul>
    </section>
  );
};

export default SocialLinks;
