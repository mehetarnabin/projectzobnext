// pages/EditProfileHeaderPage.jsx
import React from "react";
import EditProfileHeader from "../components/Profile/EditProfileHeader";
import { useNavigate } from "react-router-dom";

const EditProfileHeaderPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <EditProfileHeader />
    </div>
  );
};

export default EditProfileHeaderPage;
