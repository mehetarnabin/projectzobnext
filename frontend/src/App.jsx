import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import JobSearchPage from "./pages/JobSearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployerRegisterPage from "./pages/EmployerRegisterPage";
import PostJobPage from "./pages/PostJobPage";
import JobseekerProfile from "./pages/JobseekerProfile";
import EmployerDashboard from "./pages/EmployerDashboard";
// Event
import EventCard from "./components/EmployerDashboard/EventCard.jsx";
import EventPage from "./pages/EventPage.jsx";
import EventDetailsPage from './pages/EventDetailsPage';
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import StaffingDashboard from "./pages/StaffingDashboard";
import EditProfileHeaderPage from "./pages/EditProfileHeaderPage";
import EditBasicInfo from "./components/Profile/EditBasicInfo";
import EditAboutMe from "./components/Profile/EditAboutMe";
import EditEducationList from "./components/Profile/EditEducationList";
import EditExperienceList from "./components/Profile/EditExperienceList";
import EditMembershipList from "./components/Profile/EditMembershipList";
import EditCertificationList from "./components/Profile/EditCertificationList";
import EditLicenseList from "./components/Profile/EditLicenseList";
import { ProfileProvider } from "./context/ProfileContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WorkinprogressDashboard from "./pages/WorkinprogressDashboard";
import ApplyJobPage from './pages/ApplyJobPage';
import PostedJobsPage from "./pages/PostedJobsPage.jsx";
import ApplicantsPage from "./pages/ApplicantsPage.jsx";
import ApplicantDetailsPage from "./pages/ApplicantDetailsPage.jsx";
import JobApplicantsListPage from './pages/JobApplicantsListPage';
import ScheduleInterviewPage from './pages/ScheduleInterviewPage';
// Employer Profile
import EmployerProfilePage from "./pages/EmployerProfilePage.jsx";
import EditEmployerProfileHeaderPage from "./pages/EditEmployerProfileHeaderPage.jsx";
import EditEmployerUserProfilePage from "./pages/EditEmployerUserProfilePage.jsx";
import { EmployerProfileProvider } from "./context/EmployerProfileContext.jsx";
// Admin
import AdminRegister from "./pages/AdminRegister";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
// Add this import at the top with other pages
import EmployerSubscriptionPage from "./pages/EmployerSubscriptionPage.jsx";


const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <EmployerProfileProvider>
            <Routes>
              {/* ---------- USER/EMPLOYER ROUTES WITH LAYOUT ---------- */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/jobs" element={<JobSearchPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/employerregister" element={<EmployerRegisterPage />} />
                <Route path="/postjob" element={<PostJobPage />} />
                <Route path="/profile" element={<JobseekerProfile />} />
                <Route path="/employer/dashboard" element={<EmployerDashboard />} />
                <Route path="/jobseeker/dashboard/*" element={<JobSeekerDashboard />} />
                <Route path="/staffing/dashboard" element={<StaffingDashboard />} />
                <Route path="/apply-job/:jobId" element={<ApplyJobPage />} />
                <Route path="/profile/edit-profile-head" element={<EditProfileHeaderPage />} />
                <Route path="/profile/edit-basic-info" element={<EditBasicInfo />} />
                <Route path="/profile/edit-about-info" element={<EditAboutMe />} />
                <Route path="/profile/edit-education" element={<EditEducationList />} />
                <Route path="/profile/edit-experience" element={<EditExperienceList />} />
                <Route path="/profile/edit-memberships" element={<EditMembershipList />} />
                <Route path="/profile/edit-certifications" element={<EditCertificationList />} />
                <Route path="/profile/edit-licenses" element={<EditLicenseList />} />
                <Route path="/employer/posted-jobs" element={<PostedJobsPage />} />
                <Route path="/employer/jobs/:jobId/edit" element={<div>Employer Edit Job Page (Coming Soon)</div>} />
                <Route path="/employer/post-job" element={<div>Employer Post New Job Page (Coming Soon)</div>} />
                <Route path="/employer/applicants" element={<ApplicantsPage />} />
                <Route path="/employer/applicants/:applicationId" element={<ApplicantDetailsPage />} />
                <Route path="/employer/jobs/:jobId/applicants" element={<JobApplicantsListPage />} />
                <Route path="/employer/applicants/:applicationId/schedule-interview" element={<ScheduleInterviewPage />} />
                {/* Event */}
                <Route path="/employer/EventCard" element={<EventCard />} />
                <Route path="/employer/eventpage" element={<EventPage />} />
                <Route path="/employer/event/:id" element={<EventDetailsPage />} />
                <Route path="/event/:id" element={<EventDetailsPage />} />
                {/* Employer Profile */}
                <Route path="/employer/profile" element={<EmployerProfilePage />} />
                <Route path="/employer/profile/edit-company-header" element={<EditEmployerProfileHeaderPage />} />
                <Route path="/employer/profile/edit-user-profile" element={<EditEmployerUserProfilePage />} />
              </Route>

              {/* ---------- ADMIN ROUTES (NO LAYOUT / NO HEADER-FOOTER) ---------- */}
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/employer-subscriptions" element={<EmployerSubscriptionPage />} />
            </Routes>

            <ToastContainer position="bottom-right" autoClose={3000} />
          </EmployerProfileProvider>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
