import DashboardHeader from "../components/DashboardHeader";
import DashboardStats from "../components/DashboardStats";
import JobSeekerSidebar from "../components/JobSeekerSidebar";
import JobApplicationList from "../components/JobApplicationList";
import JobSeekerDashboard from "./JobSeekerDashboard";
import RecommendedJobs from "../components/RecommendedJobs";
import ActivityFeed from "../components/ActivityFeed";
import SuggestedJobs from "../components/SuggestedJobs";
import NotificationPanel from "../components/NotificationPanel";
import UpcomingInterviews from "../components/UpcomingInterviews";
import ResumeStrength from "../components/ResumeStrength";

const WorkinprogressDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f9fbfd] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <JobSeekerSidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <DashboardHeader />
        </header>

        {/* Stats */}
        <section className="px-6 py-4">
          <DashboardStats />
        </section>

        {/* Content Grid */}
        <main className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-6 pb-8">
          {/* Left/Main Section */}
          <div className="xl:col-span-2 space-y-6">
            <JobApplicationList />
            <JobSeekerDashboard />
            <RecommendedJobs />
            <SuggestedJobs />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <NotificationPanel />
            <UpcomingInterviews />
            <ResumeStrength />
            <ActivityFeed />
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkinprogressDashboard;
