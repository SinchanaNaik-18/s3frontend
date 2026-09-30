import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { uploadFile } from '../services/api';

export default function UploadSection({ onUploadSuccess }) {
  const [imageId, setImageId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setSuccessData(null);

    // Auto-suggest imageId from file name without extension if imageId is empty
    if (!imageId.trim()) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const sanitized = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      setImageId(sanitized);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessData(null);

    if (!imageId.trim()) {
      setErrorMessage('Please provide an Image/File ID.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setLoading(true);

    try {
      const result = await uploadFile(imageId, selectedFile);
      setSuccessData(result);
      if (onUploadSuccess) {
        onUploadSuccess(imageId.trim());
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <UploadCloud size={24} />
          </div>
          <div>
            <h2 className="card-title">Upload File to S3</h2>
            <p className="card-description">Uploads directly under the S3 prefix <code className="font-mono">eventsphere/</code></p>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpload}>
        {/* 1. Image/File ID input */}
        <div className="form-group">
          <label htmlFor="upload-image-id" className="form-label">
            Image / File ID <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              id="upload-image-id"
              type="text"
              className="text-input"
              placeholder="e.g. photo1, document1, banner-01"
              value={imageId}
              onChange={(e) => setImageId(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <p className="form-help">
            S3 Object Key will be: <code className="font-mono">eventsphere/{imageId.trim() || '{imageId}'}</code>
          </p>
        </div>

        {/* 2. File selector */}
        <div className="form-group">
          <label className="form-label">
            File Selector <span className="required">*</span>
          </label>
          
          <div
            className={`dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              id="file-selector-input"
              type="file"
              className="file-input-hidden"
              onChange={handleFileChange}
              disabled={loading}
            />

            <div className="dropzone-content">
              <div className="dropzone-icon">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="dropzone-title">Click to choose a file or drag & drop</p>
                <p className="dropzone-subtitle">Images (PNG, JPG, SVG, WebP) or documents (PDF, DOCX, ZIP, etc.)</p>
              </div>
            </div>
          </div>

          {selectedFile && (
            <div className="file-preview-pill">
              <div className="file-pill-info">
                <File size={20} color="#4f46e5" />
                <div className="file-pill-details">
                  <div className="file-pill-name" title={selectedFile.name}>{selectedFile.name}</div>
                  <div className="file-pill-size">{formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}</div>
                </div>
              </div>
              <button
                type="button"
                className="btn-remove-file"
                onClick={handleRemoveFile}
                disabled={loading}
                title="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* 3. Upload button */}
        <button
          id="btn-upload-submit"
          type="submit"
          className="btn-primary"
          disabled={loading || !imageId.trim() || !selectedFile}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Uploading to S3...</span>
            </>
          ) : (
            <>
              <UploadCloud size={18} />
              <span>Upload to AWS S3</span>
            </>
          )}
        </button>
      </form>

      {/* Success Notification */}
      {successData && (
        <div className="alert alert-success">
          <CheckCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div className="alert-content">
            <div className="alert-title">File Uploaded Successfully!</div>
            <div>{successData.message}</div>
            <div className="alert-meta">
              <strong>S3 Key:</strong> <code className="font-mono">{successData.s3Key}</code>
              <br />
              <strong>Original Name:</strong> {successData.originalFilename || successData.imageId} ({formatFileSize(successData.size)})
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="alert alert-error">
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div className="alert-content">
            <div className="alert-title">Upload Failed</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
}
