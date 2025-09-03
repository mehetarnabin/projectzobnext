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
  ChevronDown,
  ChevronLeft,
  ChevronRight
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
  const [categoryDropdowns, setCategoryDropdowns] = useState({}); // For category dropdowns

  // New states for file upload UI flow
  const [pendingFiles, setPendingFiles] = useState([]); // Files waiting to be uploaded
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
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
      // Close category dropdowns if clicked outside
      if (!event.target.closest('.category-dropdown')) {
        setCategoryDropdowns({});
      }
    };

    if (showSearch || showFilter || Object.keys(actionDropdowns).length > 0 || Object.keys(categoryDropdowns).length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch, showFilter, actionDropdowns, categoryDropdowns]);

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (uploadSuccess.length > 0) {
      const timer = setTimeout(() => {
        setUploadSuccess([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  // Auto-clear error messages after 10 seconds
  useEffect(() => {
    if (uploadErrors.length > 0) {
      const timer = setTimeout(() => {
        setUploadErrors([]);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [uploadErrors]);

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

  // Handle file selection with validation
  const handleFiles = (files) => {
    const activeCategoryName = categories.find(cat => cat.id === activeCategory)?.name || 'Personal';
    const newErrors = [];
    const newPendingFiles = [];
    
    // Clear previous messages
    setUploadErrors([]);
    setUploadSuccess([]);
    
    Array.from(files).forEach(file => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`${file.name}: File size exceeds 5MB limit.`);
        return;
      }
      
      // Validate file type
      if (!ALLOWED_FILE_TYPES[fileExtension]) {
        newErrors.push(`${file.name}: Invalid file format. Allowed formats: PDF, JPG, PNG, DOC, DOCX.`);
        return;
      }
      
      // File is valid, add to pending files
      const newFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
        actualSize: file.size,
        progress: 0,
        category: activeCategoryName,
        fileType: ALLOWED_FILE_TYPES[fileExtension],
        dateUploaded: new Date().toISOString().split('T')[0],
        file: file // Keep reference to actual file object
      };
      
      newPendingFiles.push(newFile);
    });
    
    // Set errors if any
    if (newErrors.length > 0) {
      setUploadErrors(newErrors);
    }
    
    // Add valid files to pending
    if (newPendingFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...newPendingFiles]);
    }
  };

  // Remove file from pending list
  const removePendingFile = (fileId) => {
    setPendingFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Upload pending files
  const uploadPendingFiles = () => {
    if (pendingFiles.length === 0) return;
    
    setIsUploading(true);
    const activeCategoryName = categories.find(cat => cat.id === activeCategory)?.name || 'Personal';
    
    // Simulate upload process
    pendingFiles.forEach((file, index) => {
      setTimeout(() => {
        // Update progress
        const interval = setInterval(() => {
          setPendingFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, progress: Math.min(f.progress + 10, 100) }
                : f
            )
          );
        }, 100);
        
        // Complete upload after 1 second
        setTimeout(() => {
          clearInterval(interval);
          
          // Move to uploaded files
          setUploadedFiles(prev => ({
            ...prev,
            [activeCategoryName]: [...(prev[activeCategoryName] || []), { ...file, progress: 100 }]
          }));
          
          // Remove from pending
          setPendingFiles(prev => prev.filter(f => f.id !== file.id));
          
          // Add success message
          setUploadSuccess(prev => [...prev, `${file.name} uploaded successfully.`]);
          
          // Check if all files are uploaded
          if (index === pendingFiles.length - 1) {
            setIsUploading(false);
          }
        }, 1000);
      }, index * 200); // Stagger uploads
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
  const toggleActionDropdown = (fileId, event) => {
    event.stopPropagation();
    if (actionDropdowns[fileId]) {
      setActionDropdowns({});
    } else {
      // Calculate button position for dropdown positioning
      const buttonRect = event.target.getBoundingClientRect();
      const position = {
        top: buttonRect.bottom + 5, // 5px below the button
        left: buttonRect.left + (buttonRect.width / 2) // Center with button
      };
      
      setActionDropdowns({
        [fileId]: {
          open: true,
          position: position
        }
      });
    }
  };

  // Toggle category dropdown for specific file
  const toggleCategoryDropdown = (fileId, event) => {
    event.stopPropagation();
    if (categoryDropdowns[fileId]) {
      setCategoryDropdowns({});
    } else {
      const rect = event.target.getBoundingClientRect();
      setCategoryDropdowns({
        [fileId]: {
          open: true,
          position: {
            top: rect.bottom + 5,
            left: rect.left
          }
        }
      });
    }
  };

  // Change file category
  const changeFileCategory = (fileId, newCategory) => {
    const currentCategory = getCurrentCategoryName();
    const file = uploadedFiles[currentCategory]?.find(f => f.id === fileId);
    
    if (file && newCategory !== file.category) {
      // Remove file from current category
      setUploadedFiles(prev => ({
        ...prev,
        [currentCategory]: prev[currentCategory].filter(f => f.id !== fileId)
      }));
      
      // Add file to new category
      const updatedFile = { ...file, category: newCategory };
      setUploadedFiles(prev => ({
        ...prev,
        [newCategory]: [...(prev[newCategory] || []), updatedFile]
      }));
      
      // Close dropdown
      setCategoryDropdowns({});
    }
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
    <div className="p-2 sm:p-4 lg:p-6 bg-white min-h-screen overflow-x-hidden max-w-full">
      <div className="max-w-full mx-auto px-2 sm:px-4 overflow-hidden">
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

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
              title="Refresh"
            >
              <RotateCcw size={18} />
            </button>

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
        <div className="flex flex-col xl:flex-row gap-12 xl:gap-14 min-h-screen">
        
        {/* Left Side Container - Circular Hub Section */}
        <div className="w-full xl:w-[30%] xl:flex-shrink-0">
          <div className="flex justify-center xl:justify-start xl:-ml-12">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[400px] lg:h-[400px] flex items-center justify-center overflow-visible">
              
              {/* Connecting Lines - Right Half Only */}
              <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 400 400">
                {categories.map((category) => {
                  const centerX = 200;
                  const centerY = 200;
                  const innerRadius = 80;  // Start from edge of central hub
                  const outerRadius = 160; // End at category circles - increased gap
                  
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
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-30 lg:h-30 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-gray-200 z-30 relative">
                <FileText size={28} className="text-gray-600 mb-1" />
                <span className="text-xs sm:text-sm font-bold text-gray-700">Document</span>
                <span className="text-xs sm:text-sm font-bold text-gray-700">HUB</span>
              </div>

              {/* Circular Progress Ring - Right Half Only */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                    {/* Background circle - full circle */}
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      stroke="#E5E7EB"
                      strokeWidth="6"
                      fill="none"
                    />
                    {/* Progress segments - only for right half (180 degrees) */}
                    {categories.map((category, index) => {
                      const totalArc = 180; // Right half only
                      const segmentAngle = totalArc / 7; // Divide 180 degrees by 7 segments
                      const startAngle = -90 + (index * segmentAngle); // Start from top (-90 degrees)
                      const endAngle = startAngle + segmentAngle - 2; // Small gap between segments
                      
                      // Convert to SVG path for arc
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

              {/* Category Buttons positioned around right half - Fixed Positions */}
              {categories.map((category) => {
                const position = getCircularPosition(category.angle, 160); // increased radius for more gap
                
                // Calculate tooltip position based on angle to keep consistent distance from circle
                const tooltipDistance = 25; // Distance from circle edge
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
                        className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 relative z-[101] ${
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
                      
                      {/* Category Label - Positioned outside circle with consistent spacing */}
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

        {/* Right Side Container - Upload Section */}
        <div className="w-full xl:w-[65%] xl:flex-shrink-0 xl:max-w-none">
          <div className="w-full pr-1 xl:pr-2 overflow-hidden">
            <div className="space-y-6">
            {/* Upload Area - Fixed Height */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-auto">
              <div
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 transition-all duration-300 relative ${
                  dragActive 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-between">
                  {/* Left side content */}
                  <div className="flex items-center gap-4">
                    {/* Cloud Upload Icon */}
                    <CloudUpload size={40} className="text-gray-400" />
                    
                    {/* Text content */}
                    <div>
                      <span className="text-base font-medium text-gray-600">Drag and drop or</span>
                    </div>
                  </div>
                  
                  {/* Green Plus Button positioned on the right */}
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
              
              {/* Maximum file size text - positioned below the upload box */}
              <p className="text-sm text-gray-500 mt-3 text-center">Maximum File Size: 5MB</p>
              
              {/* Error Messages */}
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
              
              {/* Success Messages */}
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
              
              {/* Pending Files Preview */}
              {pendingFiles.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Files Ready for Upload</h4>
                    {!isUploading && (
                      <button
                        onClick={uploadPendingFiles}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
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
                          {/* Progress Bar */}
                          {file.progress > 0 && (
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                          )}
                          
                          {/* Delete Button */}
                          {!isUploading && (
                            <button
                              onClick={() => removePendingFile(file.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove file"
                            >
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
                  
                  {/* Table */}
                  <div className="w-full relative overflow-visible" style={{ isolation: 'isolate', overflow: 'visible' }}>
                    <table className="w-full text-xs table-fixed">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-10">
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
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </th>
                          <th className="pl-1 pr-0 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-44">
                            Document Title
                          </th>
                          <th className="pl-2 pr-1 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-18">
                            Category
                          </th>
                          <th className="px-4 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-16">
                            Size
                          </th>
                          <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-14">
                            Type
                          </th>
                          <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-20">
                            Date
                          </th>
                          <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-600 tracking-wider w-16">
                            Actions
                          </th>
                        </tr>
                      </thead>
                    <tbody className="bg-white divide-y divide-gray-200 relative">
                      {getFilteredFiles().map((file, index) => (
                        <tr key={file.id} data-file-id={file.id} className={`hover:bg-gray-50 transition-colors duration-150 relative ${
                          selectedFiles.includes(file.id) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}>
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
                                <div className="flex-shrink-0 mr-2">
                                  {getFileIcon(file.name)}
                                </div>
                                <div className="min-w-0 flex-1 overflow-hidden">
                                  <div className="text-xs font-medium text-gray-900 truncate w-32" title={file.name}>
                                    {file.name}
                                  </div>
                                  {file.progress < 100 && (
                                    <div className="w-24 h-1 bg-gray-200 rounded-full mt-1">
                                      <div 
                                        className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                                        style={{ width: `${file.progress}%` }}
                                      />
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
                                  
                                  {/* Category Dropdown Menu - Vertical */}
                                  {categoryDropdowns[file.id]?.open && (
                                    <div className="fixed z-[99999] bg-white border border-gray-300 rounded-lg shadow-2xl py-1 w-36"
                                         style={{
                                           top: `${categoryDropdowns[file.id].position.top}px`,
                                           left: `${categoryDropdowns[file.id].position.left}px`
                                         }}>
                                      {categories.map((category) => (
                                        <button
                                          key={category.id}
                                          onClick={() => changeFileCategory(file.id, category.name)}
                                          className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 block ${
                                            file.category === category.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                          }`}
                                        >
                                          {category.name}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                                  {file.category}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                              {file.size}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {file.fileType.slice(0, 3)}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                              {file.dateUploaded}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs font-medium relative overflow-visible">
                              <div className="action-dropdown relative flex justify-end overflow-visible">
                                <button
                                  onClick={(e) => toggleActionDropdown(file.id, e)}
                                  className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                    actionDropdowns[file.id]?.open 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                  title="Actions"
                                >
                                  {actionDropdowns[file.id]?.open ? (
                                    <ChevronDown size={14} className="transition-all duration-200 rotate-180" />
                                  ) : (
                                    <ChevronDown size={14} className="transition-all duration-200" />
                                  )}
                                </button>
                                
                                {/* Dropdown Menu - Positioned to stay within viewport */}
                                {actionDropdowns[file.id]?.open && (
                                  <>
                                    {/* Full screen backdrop */}
                                    <div 
                                      className="fixed inset-0 bg-transparent z-[9998]" 
                                      onClick={() => setActionDropdowns({})}
                                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                                    />
                                    
                                    <div 
                                      className="fixed bg-white border-2 border-gray-300 rounded-lg py-1 flex space-x-0 min-w-max z-[9999]"
                                      style={{ 
                                        position: 'fixed',
                                        top: actionDropdowns[file.id]?.position?.top + 'px' || '50px',
                                        left: actionDropdowns[file.id]?.position?.left + 'px' || '50px',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                                        transform: 'translateX(-50%)',
                                        zIndex: 9999
                                      }}
                                    >
                                      <button
                                        onClick={() => {
                                          handleViewFile(file);
                                          setActionDropdowns({});
                                        }}
                                        className="p-3 hover:bg-blue-50 transition-colors group border-r border-gray-200 first:rounded-l-lg"
                                        title="View"
                                      >
                                        <Eye size={18} className="text-gray-600 group-hover:text-blue-600" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDownloadFile(file);
                                          setActionDropdowns({});
                                        }}
                                        className="p-3 hover:bg-blue-50 transition-colors group border-r border-gray-200"
                                        title="Download"
                                      >
                                        <Download size={18} className="text-gray-600 group-hover:text-blue-600" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          removeFile(file.id);
                                          setActionDropdowns({});
                                        }}
                                        className="p-3 hover:bg-red-50 transition-colors group last:rounded-r-lg"
                                        title="Delete"
                                      >
                                        <X size={18} className="text-gray-600 group-hover:text-red-600" />
                                      </button>
                                    </div>
                                  </>
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
              )}
            </div>
            
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
