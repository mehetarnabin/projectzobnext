import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Filter, 
  RefreshCcw, 
  Archive,
  Eye,
  Download,
  Trash2,
  ChevronRight,
  Upload,
  FileText,
  BookOpen,
  Briefcase,
  Award,
  File,
  User
} from 'lucide-react';

const ProfileHub = () => {
  // Document categories
  const categories = [
    { id: '01', name: 'Personal', icon: <User size={18} /> },
    { id: '02', name: 'Education', icon: <BookOpen size={18} /> },
    { id: '03', name: 'Experience', icon: <Briefcase size={18} /> },
    { id: '04', name: 'Training', icon: <FileText size={18} /> },
    { id: '05', name: 'Licenses', icon: <File size={18} /> },
    { id: '06', name: 'Awards', icon: <Award size={18} /> },
    { id: '07', name: 'Others', icon: <FileText size={18} /> }
  ];

  // State for active categories
  const [activeCategories, setActiveCategories] = useState(['01']);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [expandedDocId, setExpandedDocId] = useState(null);

  // Dummy documents data
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: 'Resume.pdf',
      category: 'Personal',
      size: '2.4 MB',
      type: 'PDF',
      date: '2023-10-15',
      fileUrl: '#'
    },
    {
      id: 2,
      title: 'Degree_Certificate.pdf',
      category: 'Education',
      size: '1.8 MB',
      type: 'PDF',
      date: '2023-09-22',
      fileUrl: '#'
    },
    {
      id: 3,
      title: 'Work_Experience.docx',
      category: 'Experience',
      size: '0.5 MB',
      type: 'DOCX',
      date: '2023-11-05',
      fileUrl: '#'
    },
    {
      id: 4,
      title: 'Training_Certificate.pdf',
      category: 'Training',
      size: '3.2 MB',
      type: 'PDF',
      date: '2023-08-17',
      fileUrl: '#'
    }
  ]);

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setActiveCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }
      setSelectedFile(file);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    }
  };

  // Handle document type selection
  const handleDocTypeChange = (e) => {
    setSelectedDocType(e.target.value);
  };

  // Complete upload
  const completeUpload = () => {
    if (!selectedDocType) {
      alert('Please select a document type');
      return;
    }
    
    const newDoc = {
      id: documents.length + 1,
      title: selectedFile.name,
      category: categories.find(cat => cat.id === selectedDocType).name,
      size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
      type: selectedFile.name.split('.').pop().toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      fileUrl: '#'
    };
    
    setDocuments([...documents, newDoc]);
    setSelectedFile(null);
    setUploadProgress(0);
    setSelectedDocType('');
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  // Toggle document actions
  const toggleDocumentActions = (docId) => {
    setExpandedDocId(expandedDocId === docId ? null : docId);
  };

  // Delete document
  const deleteDocument = (docId) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  // Filter documents by active categories
  const filteredDocuments = documents.filter(doc => 
    activeCategories.includes(
      categories.find(cat => cat.name === doc.category)?.id || ''
    )
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      {/* Top Right Icons */}
      <div className="flex justify-end gap-4 mb-6">
        <button className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <button className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200">
          <Filter size={20} className="text-gray-700" />
        </button>
        <button className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200">
          <RefreshCcw size={20} className="text-gray-700" />
        </button>
        <button className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-all duration-200">
          <Archive size={20} className="text-gray-700" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side - Categories */}
        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4">Document Categories</h3>
          <ul className="space-y-2">
            {categories.map(category => (
              <li key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeCategories.includes(category.id)
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side - Upload and Documents */}
        <div className="flex-1">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="flex flex-col items-center justify-center py-4">
                <Upload size={40} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">Maximum file size: 5MB</p>
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Select File
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText size={24} className="text-gray-500 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    {uploadProgress < 100 ? (
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    ) : (
                      <select
                        className="ml-2 px-2 py-1 border rounded text-sm"
                        value={selectedDocType}
                        onChange={handleDocTypeChange}
                      >
                        <option value="">Select Document Type</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <div className="flex ml-3">
                      <button 
                        onClick={removeFile}
                        className="p-1 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                      {uploadProgress >= 100 && (
                        <button
                          onClick={completeUpload}
                          disabled={!selectedDocType}
                          className={`p-1 ml-2 ${
                            selectedDocType 
                              ? 'text-green-500 hover:text-green-600' 
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          <FileText size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Uploaded</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map(doc => (
                    <tr key={doc.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{doc.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.category}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.size}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 relative">
                        <button 
                          onClick={() => toggleDocumentActions(doc.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <ChevronRight size={18} className={`transition-transform ${
                            expandedDocId === doc.id ? 'rotate-90' : ''
                          }`} />
                        </button>
                        {expandedDocId === doc.id && (
                          <div className="absolute right-0 top-0 transform translate-x-full bg-white shadow-lg rounded-md p-1 flex z-10">
                            <button className="p-1 text-blue-500 hover:text-blue-700">
                              <Eye size={16} />
                            </button>
                            <button className="p-1 text-green-500 hover:text-green-700 mx-1">
                              <Download size={16} />
                            </button>
                            <button 
                              onClick={() => deleteDocument(doc.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHub;