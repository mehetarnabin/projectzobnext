import API_BASE_URL from "../config"; // Add this line
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react"; // Import useEffect and useCallback
import JobSearchForm from "../components/JobSearchForm";
import JobList from "../components/JobList";
import JobDetails from "../components/JobDetails";
// import jobs from "../data/jobs"; // <--- REMOVE THIS LINE!

const JobSearchPage = () => {
  const [searchParams] = useSearchParams();
  const selectedJobId = searchParams.get("jobId");

  const [jobs, setJobs] = useState([]); // State to hold fetched jobs
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const jobsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  // Calculate totalPages based on dynamic jobs array
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = jobs.slice(startIndex, startIndex + jobsPerPage);

  // const API_BASE_URL = "http://10.120.30.250:8000/api";

  // Function to fetch jobs from the API
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Construct query string from searchParams
      const queryString = searchParams.toString();
      const response = await fetch(`${API_BASE_URL}/jobs?${queryString}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setJobs(data);
      setCurrentPage(1); // Reset to first page on new search
    } catch (err) {
      setError(err.message || "Failed to fetch jobs.");
      setJobs([]); // Clear jobs on error
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  return (
    <main className="main">
      {/* Header */}
      <div className="w-full bg-[#003893] text-white py-16">
        <div className="p-4 max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-7">Find Your Dream Job</h1>
          <JobSearchForm />
        </div>
      </div>

      {/* Job Section */}
      <section className="p-4 max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Left: Job List */}
          <div className="w-full md:w-2/5 p-2">
            {loading ? (
              <div className="text-center text-gray-600">Loading jobs...</div>
            ) : error ? (
              <div className="text-center text-red-600">Error: {error}</div>
            ) : jobs.length === 0 ? (
              <div className="text-center text-gray-600">No jobs found matching your criteria.</div>
            ) : (
              <JobList
                jobs={paginatedJobs}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalJobs={jobs.length}
              />
            )}
          </div>

          {/* Right: Job Details */}
          <div className="hidden md:block md:w-3/5 p-2">
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <JobDetails jobs={jobs} jobId={selectedJobId} />
            </div>
          </div>
        </div>
      </section>

      {/* Email Alert CTA Section */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-[#f1f5f9] p-6 rounded-lg shadow-md flex flex-col md:flex-row
          items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#003893]">Discover new jobs for this search</h3>
            <p className="text-sm text-gray-600">Be the first to know about new jobs matching your search.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (userEmail) setShowAlertModal(true);
            }}
            className="flex flex-col md:flex-row gap-3 w-full md:w-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="p-3 border border-gray-300 rounded-lg w-full md:w-64"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-[#003893] text-white px-6 py-3 rounded-lg font-semibold"
            >
              Notify Me
            </button>
          </form>
        </div>
      </section>

      {/* Modal for Email Job Alert */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white max-w-md w-full rounded-lg p-6 shadow-lg relative">
            <button
              onClick={() => setShowAlertModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>

            <h3 className="text-xl font-semibold text-[#003893] mb-3">Job Alert Created!</h3>
            <p className="text-sm text-gray-600 mb-2">
              You’ll be notified at: <strong>{userEmail}</strong>
            </p>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By creating an email alert, you agree to our{" "}
              <a href="#" className="underline">Terms</a> and{" "}
              <a href="#" className="underline">Privacy Policy</a>. You can unsubscribe anytime.
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

export default JobSearchPage;