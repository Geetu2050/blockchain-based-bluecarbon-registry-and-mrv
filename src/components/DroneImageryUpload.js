// Drone Imagery Upload Component
import React, { useState, useRef } from 'react';
import { uploadDroneImagery, validateFile } from '../services/firebaseStorageService';

const DroneImageryUpload = ({ 
  projectId, 
  onUploadSuccess, 
  onUploadError,
  disabled = false 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Clear previous errors
      setValidationErrors([]);
      setUploadResult(null);
      
      // Validate file
      const validation = validateFile(file);
      
      if (validation.isValid) {
        setSelectedFile(file);
      } else {
        setValidationErrors(validation.errors);
        setSelectedFile(null);
      }
    } else {
      setSelectedFile(null);
      setValidationErrors([]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !projectId) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const result = await uploadDroneImagery(
        selectedFile, 
        projectId, 
        (progress) => {
          setUploadProgress(progress.progress);
        }
      );

      setUploadResult(result);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      // Reset form after successful upload
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({ success: false, error: error.message });
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle cancel upload
  const handleCancel = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadResult(null);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="drone-imagery-upload">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="bi bi-camera-video me-2"></i>
            Upload Drone Imagery
          </h5>
        </div>
        <div className="card-body">
          {/* File Input */}
          <div className="mb-3">
            <label className="form-label">Select Image or Video File</label>
            <input
              ref={fileInputRef}
              type="file"
              className="form-control"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
            />
            <small className="text-muted">
              Supported formats: Images (JPG, PNG, GIF, WebP) and Videos (MP4, MOV, AVI). Max size: 100MB
            </small>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="alert alert-danger">
              <ul className="mb-0">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Selected File Info */}
          {selectedFile && (
            <div className="alert alert-info">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Selected File:</strong> {selectedFile.name}
                  <br />
                  <small>Size: {formatFileSize(selectedFile.size)} | Type: {selectedFile.type}</small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  style={{ width: `${uploadProgress}%` }}
                  aria-valuenow={uploadProgress}
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                </div>
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className={`alert ${uploadResult.success ? 'alert-success' : 'alert-danger'}`}>
              {uploadResult.success ? (
                <div>
                  <h6><i className="bi bi-check-circle me-2"></i>Upload Successful!</h6>
                  <div className="mt-2">
                    <small>
                      <strong>File Hash:</strong> <code>{uploadResult.fileHash}</code>
                    </small>
                    <br />
                    <small>
                      <strong>Download URL:</strong> 
                      <a 
                        href={uploadResult.downloadURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ms-1"
                      >
                        View File
                      </a>
                    </small>
                  </div>
                </div>
              ) : (
                <div>
                  <h6><i className="bi bi-exclamation-triangle me-2"></i>Upload Failed</h6>
                  <p className="mb-0">{uploadResult.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || disabled}
            >
              {isUploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  Upload File
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isUploading}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneImageryUpload;

