import { Link, useSearchParams } from "react-router-dom";
import { MdShare, MdBookmarkBorder } from "react-icons/md";

const JobList = ({ jobs, currentPage, totalPages, onPageChange, totalJobs }) => {
  const [searchParams] = useSearchParams();
  const selectedJobId = searchParams.get("jobId");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-2">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-[#003893]">
            {totalJobs} jobs found
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sorted by</span>
            <select className="rounded bg-blue-50 p-1 text-sm text-[#003893]">
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      {jobs.length === 0 ? (
        <div className="text-center text-gray-600 py-4">No jobs to display.</div>
      ) : (
        jobs.map((job) => (
          <Link
            // This ensures other search params are preserved when selecting a job
            to={`/jobs?${searchParams.toString().replace(/&?jobId=\d+/g, '')}${searchParams.toString().includes('jobId=') ? '&' : (searchParams.toString() ? '&' : '')}jobId=${job.id}`}
            key={job.id}
            className={`relative block border-2 p-4 rounded-xl inset-shadow-md transition hover:border-[#003893] cursor-pointer ${
              selectedJobId == job.id // Use == for loose equality as jobId from URL might be string
                ? "bg-white border-[#003893]"
                : "bg-white border-gray-200"
            }`}
          >

            <div className="flex mb-4">
              {job.is_featured && (
                <div className="bg-blue-50 text-[#003893] text-xs font-medium px-3 py-1 rounded-lg">
                  Featured
                </div>
              )}
            </div>
            {/* Icons */}
            <div className="absolute top-3 right-3 flex gap-2 text-gray-500">
              <MdShare className="hover:text-blue-600 cursor-pointer" size={20} />
              <MdBookmarkBorder className="hover:text-blue-600 cursor-pointer" size={20} />
            </div>

            {/* Logo and Info */}
            {/* Use job.logo which is now the full URL */}
            {job.logo && <img src={job.logo} alt={`${job.company} logo`} className="w-24 h-12 object-contain mb-2" />}
            <h3 className="text-xl font-semibold text-[#003893]">{job.title}</h3>
            <p className="text-md font-medium text-gray-600 mb-2">{job.company}</p>
            <p className="text-md text-gray-600">{job.location}</p>
            {job.remainingdate && <p className="text-xs text-gray-500 mt-1 mb-2">Apply before {job.remainingdate}</p>}
            <div className="flex gap-2 items-center">
              <p className="rounded-lg bg-blue-50 p-2 text-xs font-medium text-gray-500">{job.work_type}</p>
              <p className="rounded-lg bg-blue-50 p-2 text-xs font-medium text-gray-500"> {job.salary} {job.salary_type}</p>
            </div>

            {/* Short Description */}
            {/* Do NOT strip HTML here, let JobDetails handle full description */}
            <p className="text-sm text-gray-600 mt-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: job.description }}></p>


            {/* Key Selling Points (only if provided and array is not empty) */}
            {job.key_points && job.key_points.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 mt-4 text-sm text-gray-700">
                  {job.key_points.map((item, index) => (
                  <li key={index}>{item}</li>
                  ))}
              </ul>
            )}

            {/* Posted Date */}
            {job.posted && <p className="text-xs text-gray-400 mt-2">Posted {job.posted}</p>}
          </Link>
        ))
      )}

    {/* Pagination */}
    {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2 text-sm font-medium">
          {Array.from(
            { length: Math.min(totalPages, 4) },
            (_, i) => i + 1
          ).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded border ${
                currentPage === page
                  ? "bg-[#003893] text-white border-[#003893]"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          {totalPages > 4 && currentPage < totalPages && (
            <>
              <span className="px-2">...</span>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default JobList;