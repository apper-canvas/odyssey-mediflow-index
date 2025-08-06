import React, { useState, useRef } from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { documentService } from '@/services/api/documentService';
import { toast } from 'react-toastify';

const DOCUMENT_CATEGORIES = [
  { value: 'Lab Reports', label: 'Lab Reports' },
  { value: 'Imaging', label: 'Imaging' },
  { value: 'Medical Records', label: 'Medical Records' },
  { value: 'Prescriptions', label: 'Prescriptions' },
  { value: 'Insurance', label: 'Insurance Documents' }
];

function DocumentUpload({ onUpload, patientName }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = async (files) => {
    const { processedFiles, errors } = await documentService.processFiles(files);
    
    if (errors.length > 0) {
      errors.forEach(error => {
        toast.error(`${error.fileName}: ${error.errors.join(', ')}`);
      });
    }

    if (processedFiles.length > 0) {
      const filesWithCategory = processedFiles.map(file => ({
        ...file,
        category: 'Medical Records' // Default category
      }));
      setSelectedFiles(prev => [...prev, ...filesWithCategory]);
    }
  };

  const updateFileCategory = (index, category) => {
    setSelectedFiles(prev => 
      prev.map((file, i) => 
        i === index ? { ...file, category } : file
      )
    );
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.warning('Please select files to upload');
      return;
    }

    setIsUploading(true);
    
    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Upload Documents
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Upload medical documents for {patientName || 'this patient'}
          </p>
        </div>
        <Badge variant="info" className="text-xs">
          Max 10MB per file
        </Badge>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }
        `}
      >
        <ApperIcon 
          name="Upload" 
          size={48} 
          className={`mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} 
        />
        
        <h4 className="text-lg font-medium text-slate-800 mb-2">
          {isDragging ? 'Drop files here' : 'Drag & drop files here'}
        </h4>
        
        <p className="text-slate-600 mb-4">
          or click to browse your files
        </p>

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <ApperIcon name="FolderOpen" size={16} className="mr-2" />
          Browse Files
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.dcm"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Supported Formats */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
        <h5 className="text-sm font-medium text-slate-700 mb-2">Supported Formats:</h5>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">PDF</Badge>
          <Badge variant="secondary" className="text-xs">JPEG</Badge>
          <Badge variant="secondary" className="text-xs">PNG</Badge>
          <Badge variant="secondary" className="text-xs">DICOM</Badge>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-slate-800">
              Selected Files ({selectedFiles.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-red-500 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <ApperIcon 
                      name={documentService.getFileIcon(file.type)} 
                      size={16} 
                      className="text-blue-600" 
                    />
                  </div>
                  
                  <div>
                    <p className="font-medium text-slate-800 text-sm truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Select
                    value={file.category}
                    onChange={(value) => updateFileCategory(index, value)}
                    options={DOCUMENT_CATEGORIES}
                    placeholder="Select category"
                    className="w-40"
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <ApperIcon name="X" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={clearAll}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ApperIcon name="Upload" size={16} className="mr-2" />
                  Upload Files
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default DocumentUpload;