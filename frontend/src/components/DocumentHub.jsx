import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Progress } from "./ui/progress";
import { Upload, Plus, FileText, X } from "lucide-react";
import { cn } from "../lib/utils";
const DOCUMENT_TYPES = [
  { id: "personal", name: "Personal", icon: "👤", color: "[#21cab9]" },
  { id: "education", name: "Education", icon: "🎓", color: "[#8bc1af]" },
  { id: "experience", name: "Experience", icon: "💼", color: "[#21cab9]" },
  { id: "training", name: "Training", icon: "📚", color: "[#8bc1af]" },
  { id: "licenses", name: "Licenses", icon: "📋", color: "[#21cab9]" },
  { id: "awards", name: "Awards", icon: "🏆", color: "[#8bc1af]" },
  { id: "others", name: "Others", icon: "📁", color: "[#8bc1af]" },
];

const DocumentHub = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 400,
    height: 350,
  });
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleFileUpload = useCallback(
    (files, category) => {
      if (!files) return;

      const targetCategory = category || selectedCategory || "personal";

      Array.from(files).forEach((file) => {
        const newFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          category: targetCategory,
          progress: 0,
          status: "uploading",
        };

        setUploadedFiles((prev) => [...prev, newFile]);

        // Simulate file upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === newFile.id
                  ? { ...f, progress: 100, status: "completed" }
                  : f
              )
            );
          } else {
            setUploadedFiles((prev) =>
              prev.map((f) => (f.id === newFile.id ? { ...f, progress } : f))
            );
          }
        }, 500);
      });
    },
    [selectedCategory]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const CategoryNode = ({ docType, position, isSelected }) => (
    <div
      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110"
      style={{ left: position.x, top: position.y }}
      onClick={() => handleCategorySelect(docType.id)}
    >
      <div
        className={cn(
          "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg transition-all duration-300",
          isSelected
            ? "bg-gradient-to-br from-[#21cab9] to-[#21cab9] scale-110 shadow-xl"
            : "bg-[#8bc1af] hover:bg-[#21cab9]"
        )}
      >
        <span className="text-lg sm:text-xl md:text-2xl">{docType.icon}</span>
      </div>
      <div className="text-center mt-2 text-xs sm:text-sm font-medium text-foreground">
        {docType.name}
      </div>
      {isSelected && (
        <div className="absolute inset-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#21cab9] opacity-20 animate-pulse" />
      )}
    </div>
  );

  const getCategoryPositions = (containerWidth, containerHeight) => {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const radius = Math.min(containerWidth, containerHeight) * 0.38;

    return DOCUMENT_TYPES.map((_, index) => {
      const angle = (index * 2 * Math.PI) / DOCUMENT_TYPES.length - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-hub-bg rounded-2xl">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side - Document Hub Visualization */}
        <div className="relative">
          <Card className="p-8 h-[350px] sm:h-[400px] bg-hub-card border-0 shadow-lg">
            <div ref={containerRef} className="relative w-full h-full">
              {/* Central Hub */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#21cab9] to-[#21cab9] flex flex-col items-center justify-center text-white shadow-xl">
                  <div className="text-xs font-bold">Document</div>
                  <div className="text-xs font-bold">HUB</div>
                  <div className="text-xs mt-1 opacity-80">Upolic</div>
                </div>
              </div>

              {/* Connection Lines */}
              {getCategoryPositions(
                containerDimensions.width,
                containerDimensions.height
              ).map((position, index) => (
                <svg
                  key={index}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  <line
                    x1={containerDimensions.width / 2}
                    y1={containerDimensions.height / 2}
                    x2={position.x}
                    y2={position.y}
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white opacity-30"
                  />
                </svg>
              ))}

              {/* Category Nodes */}
              {DOCUMENT_TYPES.map((docType, index) => (
                <CategoryNode
                  key={docType.id}
                  docType={docType}
                  position={
                    getCategoryPositions(
                      containerDimensions.width,
                      containerDimensions.height
                    )[index]
                  }
                  isSelected={selectedCategory === docType.id}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side - File Upload Interface */}
        <div className="space-y-6">
          {/* Upload Area */}
          <Card className="p-6 bg-hub-card border-0 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Upload Documents
                </h3>
                <div className="w-8 h-8 rounded-full bg-[#21cab9] flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Document Type Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">
                  Select Document Type
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Drag & Drop Area */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300",
                  isDragOver
                    ? "border-primary bg-[#d8fffb]"
                    : "border-gray-300 hover:border-[#a2ede6]"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragEnter={handleDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                role="button"
                tabIndex={0}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  Drag and drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Maximum File Size: 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    handleFileUpload(e.target.files);
                    if (e.target) e.target.value = "";
                  }}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Browse Files
                  </Button>
                </label>
              </div>
            </div>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card className="p-6 bg-hub-card border-0 shadow-lg">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Uploaded Files
              </h4>
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {
                            DOCUMENT_TYPES.find((t) => t.id === file.category)
                              ?.name
                          }
                        </span>
                      </div>
                      {file.status === "uploading" && (
                        <Progress value={file.progress} className="mt-2 h-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentHub;
