// frontend/src/pages/DocumentHub.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; // <-- centralized axios (you provided)
import {
  FileText,
  CheckCircle,
  X,
  Plus,
  CloudUpload,
  Filter,
  Search,
  RotateCcw,
  Trash2,
  Eye,
  Download,
  ChevronDown
} from 'lucide-react';

const DocumentHub = () => {
  // Categories / flower layout (keep as-is)
  const categories = [
    { id: '01', name: 'Personal', icon: <span className="text-lg font-bold">01</span>, angle: -90, color: '#20B2AA', active: true },
    { id: '02', name: 'Education', icon: <span className="text-lg font-bold">02</span>, angle: -60, color: '#B8B8B8', active: false },
    { id: '03', name: 'Experience', icon: <span className="text-lg font-bold">03</span>, angle: -30, color: '#20B2AA', active: true },
    { id: '04', name: 'Training', icon: <span className="text-lg font-bold">04</span>, angle: 0, color: '#B8B8B8', active: false },
    { id: '05', name: 'Licenses', icon: <span className="text-lg font-bold">05</span>, angle: 30, color: '#20B2AA', active: true },
    { id: '06', name: 'Awards', icon: <span className="text-lg font-bold">06</span>, angle: 60, color: '#B8B8B8', active: false },
    { id: '07', name: 'Others', icon: <span className="text-lg font-bold">07</span>, angle: 90, color: '#20B2AA', active: true }
  ];

  // State
  const [activeCategory, setActiveCategory] = useState('01');
  const [uploadedFiles, setUploadedFiles] = useState({}); // { categoryName: [files...] }
  const [dragActive, setDragActive] = useState(false);

  // Action UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [actionDropdowns, setActionDropdowns] = useState({});
  const [categoryDropdowns, setCategoryDropdowns] = useState({});

  // Upload flow states
  const [pendingFiles, setPendingFiles] = useState([]); // pending upload objects
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = {
    'pdf': 'PDF',
    'jpg': 'Image',
    'jpeg': 'Image',
    'png': 'Image',
    'gif': 'Image',
    'webp': 'Image',
    'doc': 'Document',
    'docx': 'Document'
  };

  // Helpers to compute positions for circular layout
  const getCircularPosition = (angle, radius) => {
    const radian = (angle * Math.PI) / 180;
    return { x: Math.cos(radian) * radius, y: Math.sin(radian) * radius };
  };

  // Compute backend base url for constructing storage links (fallback)
  const backendBase = 'http://192.168.43.134:8000'; 

  // ---------------------
  // Fetch documents on mount
  // ---------------------
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      // expected res.data = array of documents from backend
      const grouped = res.data.reduce((acc, doc) => {
        const cat = doc.category || 'Others';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push({
          id: doc.id,
          name: doc.name,
          size: doc.size,
          progress: 100,
          category: cat,
          fileType: doc.type,
          dateUploaded: doc.date_uploaded,
          path: doc.path
        });
        return acc;
      }, {});
      setUploadedFiles(grouped);
    } catch (err) {
      console.error('Failed to fetch documents', err);
      setUploadErrors(prev => [...prev, 'Failed to load documents from server.']);
    }
  };

  // ---------------------
  // Click outside handlers to close dropdowns/search/filter
  // ---------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container') && showSearch) setShowSearch(false);
      if (!event.target.closest('.filter-container') && showFilter) setShowFilter(false);
      if (!event.target.closest('.action-dropdown')) setActionDropdowns({});
      if (!event.target.closest('.category-dropdown')) setCategoryDropdowns({});
    };

    if (showSearch || showFilter || Object.keys(actionDropdowns).length > 0 || Object.keys(categoryDropdowns).length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch, showFilter, actionDropdowns, categoryDropdowns]);

  // Auto clear messages
  useEffect(() => {
    if (uploadSuccess.length) {
      const t = setTimeout(() => setUploadSuccess([]), 5000);
      return () => clearTimeout(t);
    }
  }, [uploadSuccess]);

  useEffect(() => {
    if (uploadErrors.length) {
      const t = setTimeout(() => setUploadErrors([]), 10000);
      return () => clearTimeout(t);
    }
  }, [uploadErrors]);

  // ---------------------
  // Drag & drop handlers
  // ---------------------
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // ---------------------
  // File validation & adding to pending
  // ---------------------
  const handleFiles = (files) => {
    const activeCategoryName = categories.find(c => c.id === activeCategory)?.name || 'Personal';
    const errs = [];
    const valids = [];

    Array.from(files).forEach(file => {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (file.size > MAX_FILE_SIZE) {
        errs.push(`${file.name}: File size exceeds 5MB.`);
        return;
      }
      if (!ALLOWED_FILE_TYPES[ext]) {
        errs.push(`${file.name}: Invalid format. Allowed: PDF, JPG, PNG, GIF, DOC, DOCX.`);
        return;
      }
      valids.push({
        id: Date.now() + Math.random(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
        actualSize: file.size,
        progress: 0,
        category: activeCategoryName,
        fileType: ALLOWED_FILE_TYPES[ext],
        dateUploaded: new Date().toISOString().split('T')[0],
        file
      });
    });

    if (errs.length) setUploadErrors(prev => [...prev, ...errs]);
    if (valids.length) setPendingFiles(prev => [...prev, ...valids]);
  };

  const removePendingFile = (fileId) => {
    setPendingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // ---------------------
  // Upload pending files to backend (real)
  // ---------------------
  const uploadPendingFiles = async () => {
    if (!pendingFiles.length) return;
    setIsUploading(true);

    // We'll upload files sequentially to make progress & UI simpler and prevent server overload
    for (let i = 0; i < pendingFiles.length; i++) {
      const p = pendingFiles[i];
      const activeCategoryName = p.category || categories.find(c => c.id === activeCategory)?.name || 'Personal';
      const form = new FormData();
      form.append('file', p.file);
      form.append('category', activeCategoryName);

      try {
        const res = await api.post('/documents', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setPendingFiles(prev => prev.map(f => f.id === p.id ? { ...f, progress: percent } : f));
          }
        });

        const newDoc = res.data;
        // push to uploadedFiles grouped by category
        setUploadedFiles(prev => ({
          ...prev,
          [activeCategoryName]: [
            ...(prev[activeCategoryName] || []),
            {
              id: newDoc.id,
              name: newDoc.name,
              size: newDoc.size,
              progress: 100,
              category: newDoc.category,
              fileType: newDoc.type,
              dateUploaded: newDoc.date_uploaded,
              path: newDoc.path
            }
          ]
        }));

        // remove from pending and show success
        setPendingFiles(prev => prev.filter(f => f.id !== p.id));
        setUploadSuccess(prev => [...prev, `${p.name} uploaded successfully.`]);
      } catch (err) {
        console.error('Upload failed for', p.name, err);
        setUploadErrors(prev => [...prev, `Failed to upload ${p.name}`]);
        // keep the pending file so user can retry or remove
      }
    }

    setIsUploading(false);
  };

  // ---------------------
  // File actions
  // ---------------------
  const getCurrentCategoryName = () => categories.find(c => c.id === activeCategory)?.name || 'Personal';
  const getCurrentCategoryFiles = () => uploadedFiles[getCurrentCategoryName()] || [];

  const getFilteredFiles = () => {
    let files = getCurrentCategoryFiles();
    if (searchTerm) {
      files = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterType !== 'all') {
      files = files.filter(f => {
        const ext = (f.name.split('.').pop() || '').toLowerCase();
        if (filterType === 'pdf') return ext === 'pdf';
        if (filterType === 'image') return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        if (filterType === 'document') return ['doc', 'docx', 'txt', 'rtf'].includes(ext);
        return true;
      });
    }
    return files;
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]);
  };

  
  // View file in new tab
  const handleViewFile = (file) => {
    const fileUrl = `${backendBase}/storage/${file.path}`;
    window.open(fileUrl, '_blank');
  };

  // Download file
  const handleDownloadFile = (file) => {
  const fileUrl = `${backendBase}/storage/${file.path}`;
  const link = document.createElement('a');
  link.href = fileUrl;
  link.setAttribute('download', file.name);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  // Delete file on server
  const removeFile = async (fileId) => {
    const categoryName = getCurrentCategoryName();
    try {
      await api.delete(`/documents/${fileId}`);
      setUploadedFiles(prev => ({
        ...prev,
        [categoryName]: prev[categoryName].filter(f => f.id !== fileId)
      }));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
      setUploadSuccess(prev => [...prev, 'Document deleted successfully.']);
    } catch (err) {
      console.error('Failed to delete', err);
      setUploadErrors(prev => [...prev, 'Failed to delete document.']);
    }
  };

  // Bulk delete selected in current category
  const handleDeleteSelected = async () => {
    if (!selectedFiles.length) return alert('Please select files to delete');
    const categoryName = getCurrentCategoryName();

    // We'll call DELETE for each selected file (could optimize server-side)
    const toDelete = selectedFiles.slice(); // copy
    for (let id of toDelete) {
      try {
        await api.delete(`/documents/${id}`);
        setUploadedFiles(prev => ({
          ...prev,
          [categoryName]: prev[categoryName].filter(f => f.id !== id)
        }));
      } catch (err) {
        console.error('Failed to delete', id, err);
        setUploadErrors(prev => [...prev, `Failed to delete file id ${id}`]);
      }
    }

    setSelectedFiles([]);
    setUploadSuccess(prev => [...prev, `Deleted ${toDelete.length} file(s)`]);
  };

  // Toggle action dropdown for a file (positions)
  const toggleActionDropdown = (fileId, event) => {
    event.stopPropagation();
    if (actionDropdowns[fileId]) {
      setActionDropdowns({});
    } else {
      const rect = event.target.getBoundingClientRect();
      setActionDropdowns({
        [fileId]: { open: true, position: { top: rect.bottom + 5, left: rect.left + rect.width / 2 } }
      });
    }
  };

  // category dropdown for changing category
  const toggleCategoryDropdown = (fileId, event) => {
    event.stopPropagation();
    if (categoryDropdowns[fileId]) {
      setCategoryDropdowns({});
    } else {
      const rect = event.target.getBoundingClientRect();
      setCategoryDropdowns({
        [fileId]: { open: true, position: { top: rect.bottom + 5, left: rect.left } }
      });
    }
  };

  // Move file to different category (UI-only). If you want server-side move, call update endpoint here.
  const changeFileCategory = (fileId, newCategory) => {
    const currentCategory = getCurrentCategoryName();
    const file = (uploadedFiles[currentCategory] || []).find(f => f.id === fileId);
    if (!file || newCategory === file.category) {
      setCategoryDropdowns({});
      return;
    }

    // Remove from current
    setUploadedFiles(prev => ({
      ...prev,
      [currentCategory]: prev[currentCategory].filter(f => f.id !== fileId)
    }));

    // Add to new category
    const updatedFile = { ...file, category: newCategory };
    setUploadedFiles(prev => ({
      ...prev,
      [newCategory]: [...(prev[newCategory] || []), updatedFile]
    }));

    setCategoryDropdowns({});

    // OPTIONAL: To persist category change on server, call your backend update endpoint here:
    // api.patch(`/documents/${fileId}`, { category: newCategory }).catch(err => { /* handle error, revert UI if needed */ });
  };

  // Refresh handler clears search/filter and optionally refetches
  const handleRefresh = () => {
    setSearchTerm('');
    setFilterType('all');
    setSelectedFiles([]);
    setShowSearch(false);
    setShowFilter(false);
    // refetch from server
    fetchDocuments();
  };

  // Get file icon (simple)
  const getFileIcon = (fileName) => {
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    return <FileText size={16} className={`text-${ext === 'pdf' ? 'red' : ext === 'doc' || ext === 'docx' ? 'blue' : 'gray'}-500`} />;
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 bg-white min-h-screen overflow-x-hidden max-w-full">
      <div className="max-w-full mx-auto px-2 sm:px-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Document Hub File upload section</h1>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative search-container">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${showSearch ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Search documents"
              >
                <Search size={18} />
              </button>
              {showSearch && (
                <div className="absolute top-12 right-0 z-[100]">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-lg shadow-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
              title="Refresh"
            >
              <RotateCcw size={18} />
            </button>

            {/* Filter */}
            <div className="relative filter-container">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${showFilter ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Filter documents"
              >
                <Filter size={18} />
              </button>
              {showFilter && (
                <div className="absolute top-12 right-0 z-[100] bg-white border border-gray-300 rounded-lg shadow-xl py-1 w-32">
                  {[
                    { value: 'all', label: 'All Files' },
                    { value: 'pdf', label: 'PDF Files' },
                    { value: 'image', label: 'Images' },
                    { value: 'document', label: 'Documents' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setFilterType(option.value); setShowFilter(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${filterType === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delete selected */}
            <button
              onClick={handleDeleteSelected}
              disabled={selectedFiles.length === 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${selectedFiles.length > 0 ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              title={`Delete selected (${selectedFiles.length})`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Main layout: left flower, right content */}
        <div className="flex flex-col xl:flex-row gap-12 xl:gap-14 min-h-screen">
          {/* Left: Flower hub */}
          <div className="w-full xl:w-[30%] xl:flex-shrink-0">
            <div className="flex justify-center xl:justify-start xl:-ml-12">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[400px] lg:h-[400px] flex items-center justify-center overflow-visible">
                {/* SVG connecting lines */}
                <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 400 400">
                  {categories.map((category) => {
                    const centerX = 200;
                    const centerY = 200;
                    const innerRadius = 80;
                    const outerRadius = 160;
                    const pos = getCircularPosition(category.angle, 1);
                    const startX = centerX + (pos.x * innerRadius);
                    const startY = centerY + (pos.y * innerRadius);
                    const endX = centerX + (pos.x * outerRadius);
                    const endY = centerY + (pos.y * outerRadius);
                    return (
                      <line
                        key={`line-${category.id}`}
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke={category.active ? category.color : '#E5E7EB'}
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>

                {/* Central hub */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-30 lg:h-30 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-gray-200 z-30 relative">
                  <FileText size={28} className="text-gray-600 mb-1" />
                  <span className="text-xs sm:text-sm font-bold text-gray-700">Document</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-700">HUB</span>
                </div>

                {/* Circular progress ring (right half) */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="60" stroke="#E5E7EB" strokeWidth="6" fill="none" />
                      {categories.map((category, index) => {
                        const totalArc = 180;
                        const segmentAngle = totalArc / categories.length;
                        const startAngle = -90 + (index * segmentAngle);
                        const endAngle = startAngle + segmentAngle - 2;
                        const radius = 60;
                        const startRadian = (startAngle * Math.PI) / 180;
                        const endRadian = (endAngle * Math.PI) / 180;
                        const startX = 70 + radius * Math.cos(startRadian);
                        const startY = 70 + radius * Math.sin(startRadian);
                        const endX = 70 + radius * Math.cos(endRadian);
                        const endY = 70 + radius * Math.sin(endRadian);
                        const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                        return (
                          <path
                            key={category.id}
                            d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
                            stroke={category.active ? category.color : '#E5E7EB'}
                            strokeWidth="6"
                            fill="none"
                            className="transition-all duration-500"
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Category Buttons */}
                {categories.map((category) => {
                  const position = getCircularPosition(category.angle, 160);
                  const tooltipDistance = 25;
                  const tooltipPosition = getCircularPosition(category.angle, tooltipDistance);

                  return (
                    <div
                      key={category.id}
                      className="absolute z-[100] group"
                      style={{
                        left: `calc(50% + ${position.x}px)`,
                        top: `calc(50% + ${position.y}px)`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="relative">
                        <button
                          onClick={() => setActiveCategory(category.id)}
                          className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 relative z-[101] ${activeCategory === category.id ? 'text-white border-white' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
                          style={{
                            backgroundColor: category.active ? category.color : (activeCategory === category.id ? category.color : 'white')
                          }}
                          title={category.name}
                        >
                          {category.icon}
                        </button>

                        <div
                          className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[200] pointer-events-none"
                          style={{
                            left: `${tooltipPosition.x}px`,
                            top: `${tooltipPosition.y}px`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-2xl border border-gray-700">
                            {category.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side - Upload section & Table */}
          <div className="w-full xl:w-[65%] xl:flex-shrink-0 xl:max-w-none">
            <div className="w-full pr-1 xl:pr-2 overflow-hidden">
              <div className="space-y-6">
                {/* Upload area */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-auto">
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-8 transition-all duration-300 relative ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CloudUpload size={40} className="text-gray-400" />
                        <div>
                          <span className="text-base font-medium text-gray-600">Drag and drop or</span>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full cursor-pointer hover:bg-green-600 transition-colors shadow-lg">
                          <Plus size={24} />
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                            onChange={(e) => handleFiles(e.target.files)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-3 text-center">Maximum File Size: 5MB</p>

                  {/* Errors */}
                  {uploadErrors.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadErrors.map((error, index) => (
                        <div key={index} className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                          <X size={16} className="flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Success */}
                  {uploadSuccess.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadSuccess.map((message, index) => (
                        <div key={index} className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                          <CheckCircle size={16} className="flex-shrink-0" />
                          <span>{message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pending files preview */}
                  {pendingFiles.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Files Ready for Upload</h4>
                        {!isUploading && (
                          <button onClick={uploadPendingFiles} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                            Upload All Files
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {pendingFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <FileText size={20} className="text-gray-500" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                                <p className="text-xs text-gray-500">{file.size} • {file.fileType}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {file.progress > 0 && (
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${file.progress}%` }} />
                                </div>
                              )}

                              {!isUploading && (
                                <button onClick={() => removePendingFile(file.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Remove file">
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Uploaded Documents */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-visible min-h-[400px]">
                  {getFilteredFiles().length > 0 ? (
                    <>
                      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">Uploaded Documents</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage your uploaded files for {getCurrentCategoryName()}</p>
                      </div>

                      <div className="max-h-[1400px] overflow-y-auto relative" style={{ isolation: 'isolate' }}>
                        <table className="w-full text-xs table-fixed">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-10">
                                <input
                                  type="checkbox"
                                  checked={selectedFiles.length === getFilteredFiles().length && getFilteredFiles().length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedFiles(getFilteredFiles().map(f => f.id));
                                    else setSelectedFiles([]);
                                  }}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </th>
                              <th className="pl-1 pr-0 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-44">Document Title</th>
                              <th className="pl-2 pr-1 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-18">Category</th>
                              <th className="px-4 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-16">Size</th>
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-14">Type</th>
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-20">Date</th>
                              <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-16">Actions</th>
                            </tr>
                          </thead>

                          <tbody className="bg-white divide-y divide-gray-200 relative">
                            {getFilteredFiles().map((file, index) => (
                              <tr key={file.id} data-file-id={file.id} className={`hover:bg-gray-50 transition-colors duration-150 relative ${selectedFiles.includes(file.id) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={selectedFiles.includes(file.id)}
                                    onChange={() => toggleFileSelection(file.id)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                </td>

                                <td className="pl-1 pr-0 py-2 whitespace-nowrap w-44 max-w-44">
                                  <div className="flex items-center overflow-hidden">
                                    <div className="flex-shrink-0 mr-2">{getFileIcon(file.name)}</div>
                                    <div className="min-w-0 flex-1 overflow-hidden">
                                      <div className="text-xs font-medium text-gray-900 truncate w-32" title={file.name}>{file.name}</div>
                                      {file.progress < 100 && (
                                        <div className="w-24 h-1 bg-gray-200 rounded-full mt-1">
                                          <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${file.progress}%` }} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="pl-2 pr-1 py-2 whitespace-nowrap relative overflow-visible">
                                  {file.fileType === 'PDF' || file.fileType === 'Document' ? (
                                    <div className="category-dropdown relative overflow-visible">
                                      <button
                                        onClick={(e) => toggleCategoryDropdown(file.id, e)}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                                        title="Change Category"
                                      >
                                        {file.category}
                                        <ChevronDown size={12} className="ml-1" />
                                      </button>

                                      {categoryDropdowns[file.id]?.open && (
                                        <div className="fixed z-[99999] bg-white border border-gray-300 rounded-lg shadow-2xl py-1 w-36" style={{ top: `${categoryDropdowns[file.id].position.top}px`, left: `${categoryDropdowns[file.id].position.left}px` }}>
                                          {categories.map((category) => (
                                            <button
                                              key={category.id}
                                              onClick={() => changeFileCategory(file.id, category.name)}
                                              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 block ${file.category === category.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                                            >
                                              {category.name}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">{file.category}</span>
                                  )}
                                </td>

                                <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{file.size}</td>

                                <td className="px-3 py-2 whitespace-nowrap">
                                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{file.fileType.slice(0, 3)}</span>
                                </td>

                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{file.dateUploaded}</td>

                                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium relative">
                                  <div className="relative flex justify-end">
                                    <button
                                      onClick={(e) => toggleActionDropdown(file.id, e)}
                                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${actionDropdowns[file.id]?.open ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                      title="Actions"
                                    >
                                      <ChevronDown size={14} className={`transition-transform duration-200 ${actionDropdowns[file.id]?.open ? 'rotate-180' : ''}`} />
                                    </button>

                                    {actionDropdowns[file.id]?.open && (
                                      <div
                                        className="action-dropdown absolute top-full right-0 mt-1 -translate-x-2 -translate-y-8 bg-white border border-gray-300 rounded shadow z-50 flex"
                                        onClick={(e) => e.stopPropagation()} // Prevent outside click from closing immediately
                                      >
                                        <button
                                          onClick={() => {
                                            handleViewFile(file);
                                            setActionDropdowns({}); // close dropdown after action
                                          }}
                                          className="px-2 py-1 hover:bg-blue-50 transition-colors border-r border-gray-200 first:rounded-l-sm"
                                          title="View"
                                        >
                                          <Eye size={16} className="text-gray-600 hover:text-blue-600" />
                                        </button>

                                        <button
                                          onClick={() => {
                                            handleDownloadFile(file);
                                            setActionDropdowns({}); // close dropdown after action
                                          }}
                                          className="px-2 py-1 hover:bg-blue-50 transition-colors border-r border-gray-200"
                                          title="Download"
                                        >
                                          <Download size={16} className="text-gray-600 hover:text-blue-600" />
                                        </button>

                                        <button
                                          onClick={() => {
                                            removeFile(file.id);
                                            setActionDropdowns({}); // close dropdown after action
                                          }}
                                          className="px-2 py-1 hover:bg-red-50 transition-colors last:rounded-r-sm"
                                          title="Delete"
                                        >
                                          <X size={16} className="text-gray-600 hover:text-red-600" />
                                        </button>
                                      </div>
                                    )}

                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <FileText size={40} className="mx-auto text-gray-400 mb-3" />
                      <h3 className="text-base font-medium text-gray-900 mb-2">No Documents Found</h3>
                      <p className="text-sm text-gray-500">
                        {getCurrentCategoryFiles().length === 0 ? `No files uploaded for ${getCurrentCategoryName()}` : 'No files match your search/filter criteria'}
                      </p>
                      {getCurrentCategoryFiles().length > 0 && (
                        <button onClick={() => { setSearchTerm(''); setFilterType('all'); }} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors">
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Selection summary */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">{selectedFiles.length} file(s) selected</span>
                      <div className="flex space-x-2">
                        <button onClick={() => setSelectedFiles([])} className="text-xs text-blue-600 hover:text-blue-800 underline">Clear selection</button>
                        <button onClick={handleDeleteSelected} className="text-xs text-red-600 hover:text-red-800 underline">Delete selected</button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentHub;
