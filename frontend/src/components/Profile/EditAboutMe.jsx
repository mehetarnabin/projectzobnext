import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaHistory, FaMagic } from "react-icons/fa";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext"; // Import useAuth

const MAX_LENGTH = 3000;

const EditAboutMe = () => {
  const { profileData, updateAboutMe, loading } = useProfile();
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext
  const [editAbout, setEditAbout] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  // Initialize editAbout from profileData when it loads and the user is authenticated
  useEffect(() => {
    if (isAuthenticated && profileData && profileData.about !== undefined) {
      setEditAbout(profileData.about || "");
    } else if (!isAuthenticated) {
      // Clear editAbout if the user becomes unauthenticated while on this page
      setEditAbout("");
    }
  }, [profileData, isAuthenticated]); // Add isAuthenticated to dependency array

  const handleSave = async () => {
    setError(""); // Clear previous errors
    if (!editAbout.trim()) {
      setError("This field is required.");
      return;
    }
    if (editAbout.length > MAX_LENGTH) {
      setError(`Maximum ${MAX_LENGTH} characters allowed.`);
      return;
    }

    // Capture current 'about' from profileData before updating
    // Only add to history if there's actual content to save
    if (profileData.about && profileData.about.trim() !== "") {
      setHistory((prev) => [{ content: profileData.about, date: new Date() }, ...prev]);
    }

    await updateAboutMe(editAbout);
    navigate("/profile");
    // Toast success/error will be handled by the updateAboutMe function in context
  };

  const handleAIGenerate = () => {
    // Simulate AI generation - replace this with real AI call
    const aiGenerated = `### About Me

Innovative Civil Engineer with 12+ years of progressive leadership in public infrastructure, transport planning, and urban development across major Australian cities.

- Successfully delivered 25+ civil design projects exceeding $120M in value
- Member of Engineers Australia and ICE UK
- Passionate about mentoring and sustainable infrastructure innovation`;

    setEditAbout(aiGenerated);
    toast.info("AI-generated summary applied");
  };

  // Render nothing or redirect if not authenticated
  if (!isAuthenticated && !loading) {
    navigate("/login"); // Or render a "Please log in" message
    return null;
  }

  // Adjusted loading state: Show loading if profileData isn't loaded yet AND user is authenticated
  // If not authenticated, we already handled the redirect above.
  if (loading && isAuthenticated) {
    return <div className="text-center p-4">Loading editor...</div>;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Edit About Me</h3>
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        About Me
      </label>
      <textarea
        rows="10"
        className={`border p-2 rounded-4xl border-gray-200 inset-shadow-lg w-full ${error ? "border-red-500" : ""}`}
        value={editAbout}
        onChange={(e) => setEditAbout(e.target.value)}
      />
      <div className="flex flex-wrap">
        <div className="flex flex-wrap flex-1 gap-2">
          <button
            className="bg-white border text-indigo-500 px-3 py-3 rounded-full border-indigo-500 text-sm flex items-center gap-1 hover:bg-indigo-600 hover:text-white"
            onClick={handleAIGenerate}
            title="A.I. generate"
          >
            <FaMagic />
          </button>
          <button
            className="text-gray-700 border border-gray-500 px-3 py-3 rounded-full hover:text-white hover:bg-gray-500 text-sm"
            onClick={() => setShowHistory(!showHistory)}
            title="Toggle Edit History"
          >
            <FaHistory />
          </button>
        </div>
        <div className="text-xs text-gray-500 text-right">{editAbout.length}/{MAX_LENGTH}</div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <div>
        {showHistory && history.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <h4 className="text-sm font-semibold mb-2">Edit History</h4>
            <ul className="text-xs space-y-2 text-gray-600 max-h-64 overflow-auto">
              {history.map((h, idx) => (
                <li key={idx} className="border p-2 rounded bg-gray-50">
                  <div className="mb-1 text-[10px] text-gray-500">{h.date.toLocaleString()}</div>
                  <ReactMarkdown>{h.content}</ReactMarkdown>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-6">
        <button
          className="bg-white text-[#003893] px-4 py-2 border border-[#003893] rounded-4xl text-sm flex items-center gap-1 hover:text-white hover:bg-[#003893]"
          onClick={handleSave}
          disabled={loading}
        >
          <FaSave /> {loading ? "Saving..." : "Save"}
        </button>
        <button
          className="bg-white text-gray-700 px-4 py-2 border border-gray-500 rounded-4xl text-sm flex items-center gap-1 hover:text-white hover:bg-gray-500"
          onClick={() => navigate("/profile")}
          disabled={loading}
        >
          <FaTimes /> Cancel
        </button>
      </div>
    </section>
  );
};

export default EditAboutMe;