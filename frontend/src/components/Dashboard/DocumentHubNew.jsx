import React, { useState, useEffect } from 'react';
import { 
  Upload,
  FileText,
  BookOpen,
  Briefcase,
  Award,
  File,
  User,
  Users,
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
  // Document categories positioned in right half (180 degrees arc)
  const categories = [
    { id: '01', name: 'Personal', icon: <span className="text-lg font-bold">01</span>, angle: -90, color: '#20B2AA', active: true },    // 12 o'clock
    { id: '02', name: 'Education', icon: <span className="text-lg font-bold">02</span>, angle: -60, color: '#B8B8B8', active: false }, // 1 o'clock
    { id: '03', name: 'Experience', icon: <span className="text-lg font-bold">03</span>, angle: -30, color: '#20B2AA', active: true }, // 2 o'clock
    { id: '04', name: 'Training', icon: <span className="text-lg font-bold">04</span>, angle: 0, color: '#B8B8B8', active: false },    // 3 o'clock
    { id: '05', name: 'Licenses', icon: <span className="text-lg font-bold">05</span>, angle: 30, color: '#20B2AA', active: true },        // 4 o'clock
    { id: '06', name: 'Awards', icon: <span className="text-lg font-bold">06</span>, angle: 60, color: '#B8B8B8', active: false },        // 5 o'clock
    { id: '07', name: 'Others', icon: <span className="text-lg font-bold">07</span>, angle: 90, color: '#20B2AA', active: true }          // 6 o'clock
  ];

  // State management
  const [activeCategory, setActiveCategory] = useState('01');
  const [uploadedFiles, setUploadedFiles] = useState({
    'Personal': [
      { id: 1, name: 'resume.pdf', size: '2.5MB', progress: 100, category: 'Personal', fileType: 'PDF', dateUploaded: '2023-10-15' },
      { id: 2, name: 'profile_photo.jpg', size: '1.2MB', progress: 100, category: 'Personal', fileType: 'Image', dateUploaded: '2023-10-12' },
      { id: 3, name: 'identity_card.pdf', size: '800KB', progress: 100, category: 'Personal', fileType: 'PDF', dateUploaded: '2023-10-10' }
    ],
    'Education': [
      { id: 4, name: 'degree_certificate.pdf', size: '3.1MB', progress: 100, category: 'Education', fileType: 'PDF', dateUploaded: '2023-10-08' },
      { id: 5, name: 'transcript.pdf', size: '2.8MB', progress: 100, category: 'Education', fileType: 'PDF', dateUploaded: '2023-10-05' }
    ],
    'Experience': [
      { id: 6, name: 'experience_letter.pdf', size: '1.5MB', progress: 100, category: 'Experience', fileType: 'PDF', dateUploaded: '2023-10-01' },
      { id: 7, name: 'recommendation.pdf', size: '900KB', progress: 100, category: 'Experience', fileType: 'PDF', dateUploaded: '2023-09-28' }
    ],
    'Training': [
      { id: 8, name: 'training_certificate.pdf', size: '2.2MB', progress: 100, category: 'Training', fileType: 'PDF', dateUploaded: '2023-09-25' }
    ],
    'Licenses': [
      { id: 9, name: 'driving_license.pdf', size: '1.1MB', progress: 100, category: 'Licenses', fileType: 'PDF', dateUploaded: '2023-09-20' },
      { id: 10, name: 'professional_license.pdf', size: '1.8MB', progress: 100, category: 'Licenses', fileType: 'PDF', dateUploaded: '2023-09-18' }
    ],
    'Awards': [
      { id: 11, name: 'achievement_award.pdf', size: '1.3MB', progress: 100, category: 'Awards', fileType: 'PDF', dateUploaded: '2023-09-15' }
    ],
    'Others': [
      { id: 12, name: 'portfolio.pdf', size: '4.2MB', progress: 100, category: 'Others', fileType: 'PDF', dateUploaded: '2023-09-10' }
    ]
  });
  const [dragActive, setDragActive] = useState(false);
  
  // New states for action buttons
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'pdf', 'image', 'document'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [actionDropdowns, setActionDropdowns] = useState({}); // For file action dropdowns

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search if clicked outside search container
      if (!event.target.closest('.search-container') && showSearch) {
        setShowSearch(false);
      }
      // Close filter if clicked outside filter container
      if (!event.target.closest('.filter-container') && showFilter) {
        setShowFilter(false);
      }
      // Close action dropdowns if clicked outside
      if (!event.target.closest('.action-dropdown')) {
        setActionDropdowns({});
      }
    };

    if (showSearch || showFilter || Object.keys(actionDropdowns).length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch, showFilter, actionDropdowns]);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file selection
  const handleFiles = (files) => {
    const activeCategoryName = categories.find(cat => cat.id === activeCategory)?.name || 'Personal';
    
    Array.from(files).forEach(file => {
      if (file.size <= 5 * 1024 * 1024) { // 5MB limit
        const fileExtension = file.name.split('.').pop().toLowerCase();
        let fileType = 'Document';
        
        if (['pdf'].includes(fileExtension)) {
          fileType = 'PDF';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
          fileType = 'Image';
        } else if (['doc', 'docx'].includes(fileExtension)) {
          fileType = 'Document';
        }
        
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
          progress: 0,
          category: activeCategoryName,
          fileType: fileType,
          dateUploaded: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        };
        
        setUploadedFiles(prev => ({
          ...prev,
          [activeCategoryName]: [...(prev[activeCategoryName] || []), newFile]
        }));
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadedFiles(prev => ({
            ...prev,
            [activeCategoryName]: prev[activeCategoryName].map(f => 
              f.id === newFile.id ? { ...f, progress } : f
            )
          }));
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 200);
      }
    });
  };

  // Remove file
  const removeFile = (fileId) => {
    const activeCategoryName = categories.find(cat => cat.id === activeCategory)?.name || 'Personal';
    console.log('Removing file ID:', fileId, 'from category:', activeCategoryName);
    setUploadedFiles(prev => ({
      ...prev,
      [activeCategoryName]: prev[activeCategoryName].filter(f => f.id !== fileId)
    }));
    // Also remove from selected files if it was selected
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  };

  // Get current category files
  const getCurrentCategoryFiles = () => {
    const activeCategoryName = categories.find(cat => cat.id === activeCategory)?.name || 'Personal';
    return uploadedFiles[activeCategoryName] || [];
  };

  // Get current category name
  const getCurrentCategoryName = () => {
    return categories.find(cat => cat.id === activeCategory)?.name || 'Personal';
  };

  // Get file count for each category
  const getFileCount = (categoryName) => {
    return uploadedFiles[categoryName]?.length || 0;
  };

  // Calculate position for circular layout
  const getCircularPosition = (angle, radius) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  // Action button functions
  const handleSearch = (term) => {
    setSearchTerm(term);
    console.log('Searching for:', term);
  };

  const handleFilter = (type) => {
    setFilterType(type);
    console.log('Filter changed to:', type);
  };

  const handleRefresh = () => {
    // Refresh the current category files
    console.log('Refreshing files for category:', getCurrentCategoryName());
    
    // Clear all filters and search
    setSearchTerm('');
    setFilterType('all');
    setSelectedFiles([]);
    setShowSearch(false);
    setShowFilter(false);
    
    // Show confirmation
    alert(`Refreshed ${getCurrentCategoryName()} category`);
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.length > 0) {
      const categoryName = getCurrentCategoryName();
      console.log('Deleting selected files:', selectedFiles, 'from category:', categoryName);
      
      setUploadedFiles(prev => ({
        ...prev,
        [categoryName]: prev[categoryName].filter(file => !selectedFiles.includes(file.id))
      }));
      
      // Clear selected files after deletion
      setSelectedFiles([]);
      
      // Show confirmation (you can replace with toast notification)
      alert(`Successfully deleted ${selectedFiles.length} file(s) from ${categoryName}`);
    } else {
      alert('Please select files to delete');
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // File action functions
  const handleViewFile = (file) => {
    // Open file in new tab for viewing
    console.log('Viewing file:', file.name);
    // In real implementation, you would open the actual file URL
    window.open(`/files/${file.name}`, '_blank');
  };

  const handleDownloadFile = (file) => {
    // Download the file
    console.log('Downloading file:', file.name);
    // In real implementation, you would trigger actual download
    const link = document.createElement('a');
    link.href = `/files/${file.name}`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText size={16} className="text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText size={16} className="text-blue-500" />;
      case 'doc':
      case 'docx':
        return <FileText size={16} className="text-blue-600" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  // Toggle action dropdown for specific file
  const toggleActionDropdown = (fileId) => {
    setActionDropdowns(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  // Filter files based on search and filter criteria
  const getFilteredFiles = () => {
    let files = getCurrentCategoryFiles();
    
    // Apply search filter
    if (searchTerm) {
      files = files.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      files = files.filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        switch (filterType) {
          case 'pdf':
            return extension === 'pdf';
          case 'image':
            return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
          case 'document':
            return ['doc', 'docx', 'txt', 'rtf'].includes(extension);
          default:
            return true;
        }
      });
    }
    
    return files;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title and Action Buttons */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Document Hub File upload section</h1>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <div className="relative search-container">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  showSearch ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Search documents"
              >
                <Search size={18} />
              </button>
              
              {/* Search Input */}
              {showSearch && (
                <div className="absolute top-12 right-0 z-[100]">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-lg shadow-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative filter-container">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  showFilter ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Filter documents"
              >
                <Filter size={18} />
              </button>
              
              {/* Filter Dropdown */}
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
                      onClick={() => {
                        handleFilter(option.value);
                        setShowFilter(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                        filterType === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
              title="Refresh"
            >
              <RotateCcw size={18} />
            </button>

            {/* Delete Selected Button */}
            <button
              onClick={handleDeleteSelected}
              disabled={selectedFiles.length === 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                selectedFiles.length > 0 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={`Delete selected (${selectedFiles.length})`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
        
        {/* Left Side Container - Circular Hub Section */}
        <div className="w-full xl:w-1/2">
          <div className="flex justify-start xl:justify-start xl:pl-0 xl:-ml-12">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[450px] lg:h-[450px] flex items-center justify-center">
              
              {/* Connecting Lines - Right Half Only */}
              <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 450 450">
                {categories.map((category) => {
                  const centerX = 225;
                  const centerY = 225;
                  const innerRadius = 85;  // Start from edge of central hub
                  const outerRadius = 180; // End at category circles
                  
                  const position = getCircularPosition(category.angle, 1);
                  const startX = centerX + (position.x * innerRadius);
                  const startY = centerY + (position.y * innerRadius);
                  const endX = centerX + (position.x * outerRadius);
                  const endY = centerY + (position.y * outerRadius);
                  
                  return (
                    <line
                      key={`line-${category.id}`}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={category.active ? category.color : '#E5E7EB'}
                      strokeWidth="4"
                      className="transition-all duration-300"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* Central Hub Circle - Fixed Position */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-gray-200 z-30 relative">
                <FileText size={32} className="text-gray-600 mb-1" />
                <span className="text-sm sm:text-base font-bold text-gray-700">Document</span>
                <span className="text-sm sm:text-base font-bold text-gray-700">HUB</span>
              </div>

              {/* Circular Progress Ring - Right Half Only */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-44 h-44 sm:w-48 sm:h-48 lg:w-52 lg:h-52">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    {/* Background circle - full circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress segments - only for right half (180 degrees) */}
                    {categories.map((category, index) => {
                      const totalArc = 180; // Right half only
                      const segmentAngle = totalArc / 7; // Divide 180 degrees by 7 segments
                      const startAngle = -90 + (index * segmentAngle); // Start from top (-90 degrees)
                      const endAngle = startAngle + segmentAngle - 2; // Small gap between segments
                      
                      // Convert to SVG path for arc
                      const radius = 70;
                      const startRadian = (startAngle * Math.PI) / 180;
                      const endRadian = (endAngle * Math.PI) / 180;
                      
                      const startX = 80 + radius * Math.cos(startRadian);
                      const startY = 80 + radius * Math.sin(startRadian);
                      const endX = 80 + radius * Math.cos(endRadian);
                      const endY = 80 + radius * Math.sin(endRadian);
                      
                      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                      
                      return (
                        <path
                          key={category.id}
                          d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
                          stroke={category.active ? category.color : '#E5E7EB'}
                          strokeWidth="8"
                          fill="none"
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Category Buttons positioned around right half - Fixed Positions */}
              {categories.map((category) => {
                const position = getCircularPosition(category.angle, 180);
                return (
                  <div 
                    key={category.id} 
                    className="absolute z-40 group"
                    style={{
                      left: `calc(50% + ${position.x}px)`,
                      top: `calc(50% + ${position.y}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 relative ${
                          activeCategory === category.id 
                            ? 'text-white border-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                        }`}
                        style={{
                          backgroundColor: category.active ? category.color : (activeCategory === category.id ? category.color : 'white')
                        }}
                        title={category.name} // Tooltip on hover
                      >
                        {category.icon}
                      </button>
                      
                      {/* Category Label - Only visible on hover */}
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">{category.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side Container - Upload Section */}
        <div className="w-full xl:w-1/2 xl:pl-8">
          <div className="flex justify-center xl:justify-start">
            <div className="w-full max-w-md xl:max-w-lg space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-center mb-4">
                  <CloudUpload size={24} className="text-gray-400 mr-2" />
                  <span className="text-gray-600 font-medium">Drag and drop or</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Maximum Files Size 5MB</p>
                
                <label className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-full cursor-pointer hover:bg-green-600 transition-colors shadow-lg text-sm">
                  <Plus size={16} className="mr-1" />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
              </div>
            </div>

            {/* Uploaded Documents */}
            {getFilteredFiles().length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">Uploaded Documents</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage your uploaded files for {getCurrentCategoryName()}</p>
                </div>
                
                {/* Table */}
                <div className="w-full max-h-60 overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-1 py-1 text-left text-xs font-medium text-gray-500 tracking-wider w-6">
                          <input
                            type="checkbox"
                            checked={selectedFiles.length === getFilteredFiles().length && getFilteredFiles().length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFiles(getFilteredFiles().map(f => f.id));
                              } else {
                                setSelectedFiles([]);
                              }
                            }}
                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 tracking-wider">
                          Document Title
                        </th>
                        <th className="px-1 py-1 text-left text-xs font-medium text-gray-500 tracking-wider w-12">
                          Category
                        </th>
                        <th className="px-1 py-1 text-left text-xs font-medium text-gray-500 tracking-wider w-12">
                          Size
                        </th>
                        <th className="px-1 py-1 text-left text-xs font-medium text-gray-500 tracking-wider w-10">
                          Type
                        </th>
                        <th className="px-1 py-1 text-left text-xs font-medium text-gray-500 tracking-wider w-12">
                          Date
                        </th>
                        <th className="px-1 py-1 text-left text-xs font-medium text-gray-500 tracking-wider w-16">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredFiles().map((file) => (
                        <tr key={file.id} className={`hover:bg-gray-50 transition-colors ${
                          selectedFiles.includes(file.id) ? 'bg-blue-50' : ''
                        }`}>
                          <td className="px-1 py-1 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes(file.id)}
                              onChange={() => toggleFileSelection(file.id)}
                              className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 mr-1">
                                {getFileIcon(file.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate max-w-24">{file.name}</div>
                                {file.progress < 100 && (
                                  <div className="w-12 h-1 bg-gray-200 rounded-full mt-1">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                                      style={{ width: `${file.progress}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-1 py-1 whitespace-nowrap">
                            <span className="inline-flex px-1 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                              {file.category.slice(0, 3)}
                            </span>
                          </td>
                          <td className="px-1 py-1 whitespace-nowrap text-xs text-gray-900">
                            {file.size}
                          </td>
                          <td className="px-1 py-1 whitespace-nowrap">
                            <span className="inline-flex px-1 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                              {file.fileType.slice(0, 3)}
                            </span>
                          </td>
                          <td className="px-1 py-1 whitespace-nowrap text-xs text-gray-900">
                            {file.dateUploaded.slice(5)}
                          </td>
                          <td className="px-1 py-1 whitespace-nowrap text-xs font-medium relative">
                            <div className="action-dropdown">
                              <button
                                onClick={() => toggleActionDropdown(file.id)}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                title="Actions"
                              >
                                <ChevronDown size={12} />
                              </button>
                              
                              {/* Dropdown Menu */}
                              {actionDropdowns[file.id] && (
                                <div className="absolute right-0 top-8 z-50 bg-white border border-gray-300 rounded-lg shadow-xl py-1 w-20">
                                  <button
                                    onClick={() => {
                                      handleViewFile(file);
                                      setActionDropdowns({});
                                    }}
                                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 flex items-center"
                                  >
                                    <Eye size={10} className="mr-1" />
                                    View
                                  </button>
                                  <button
                                    onClick={() => {
                                      removeFile(file.id);
                                      setActionDropdowns({});
                                    }}
                                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 flex items-center text-red-600"
                                  >
                                    <Trash2 size={10} className="mr-1" />
                                    Delete
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
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
                  <p className="text-gray-500">
                    {getCurrentCategoryFiles().length === 0 
                      ? `No files uploaded for ${getCurrentCategoryName()}` 
                      : 'No files match your search/filter criteria'
                    }
                  </p>
                  {getCurrentCategoryFiles().length > 0 && (
                    <button 
                      onClick={() => {setSearchTerm(''); setFilterType('all');}}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Selection Summary */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {selectedFiles.length} file(s) selected
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear selection
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Delete selected
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
        
        </div> {/* End Main Content Container */}
      </div>
    </div>
  );
};

export default DocumentHub;
