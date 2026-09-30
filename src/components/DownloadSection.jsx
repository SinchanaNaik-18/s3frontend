import React, { useState, useEffect } from 'react';
import { DownloadCloud, Eye, FileDown, AlertCircle, ExternalLink, Image as ImageIcon, FileText } from 'lucide-react';
import { downloadFile } from '../services/api';

export default function DownloadSection({ prefilledId }) {
  const [downloadId, setDownloadId] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadedResult, setDownloadedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [is404, setIs404] = useState(false);

  // Sync prefilledId when a new file was uploaded in UploadSection
  useEffect(() => {
    if (prefilledId) {
      setDownloadId(prefilledId);
    }
  }, [prefilledId]);

  const handleDownload = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIs404(false);
    setDownloadedResult(null);

    if (!downloadId.trim()) {
      setErrorMessage('Please enter an Image/File ID to download.');
      return;
    }

    setLoading(true);

    try {
      const result = await downloadFile(downloadId);
      setDownloadedResult(result);
    } catch (err) {
      setIs404(err.status === 404);
      setErrorMessage(err.message || 'Error occurred while retrieving file.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon download">
            <DownloadCloud size={24} />
          </div>
          <div>
            <h2 className="card-title">Download / View File</h2>
            <p className="card-description">Retrieves objects stored at <code className="font-mono">eventsphere/{'{imageId}'}</code></p>
          </div>
        </div>
      </div>

      <form onSubmit={handleDownload}>
        {/* 4. Download Image/File ID input */}
        <div className="form-group">
          <label htmlFor="download-image-id" className="form-label">
            Download Image / File ID <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <input
              id="download-image-id"
              type="text"
              className="text-input"
              placeholder="e.g. photo1, document1"
              value={downloadId}
              onChange={(e) => setDownloadId(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <p className="form-help">
            Fetches S3 Object Key: <code className="font-mono">eventsphere/{downloadId.trim() || '{imageId}'}</code>
          </p>
        </div>

        {/* 5. Download button */}
        <button
          id="btn-download-submit"
          type="submit"
          className="btn-secondary"
          disabled={loading || !downloadId.trim()}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Fetching from S3...</span>
            </>
          ) : (
            <>
              <DownloadCloud size={18} />
              <span>Fetch Object</span>
            </>
          )}
        </button>
      </form>

      {/* 404 / Error Alert */}
      {errorMessage && (
        <div className={`alert ${is404 ? 'alert-error' : 'alert-error'}`}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div className="alert-content">
            <div className="alert-title">{is404 ? '404 - Object Not Found' : 'Download Error'}</div>
            <div>{errorMessage}</div>
            {is404 && (
              <div className="alert-meta">
                Make sure the object was uploaded with ID <code className="font-mono">{downloadId}</code> to <code className="font-mono">eventsphere/{downloadId}</code>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Download Results Container */}
      {downloadedResult && (
        <div className="download-result">
          <div className="result-header">
            <div className="result-title">
              {downloadedResult.isImage ? <ImageIcon size={18} color="#4f46e5" /> : <FileText size={18} color="#0ea5e9" />}
              <span>ID: <code className="font-mono">{downloadedResult.imageId}</code></span>
            </div>
            <div className="badge badge-connected">
              <span>{formatFileSize(downloadedResult.size)}</span>
            </div>
          </div>

          <div className="result-body">
            {/* 6. Display the downloaded image if it is an image */}
            {downloadedResult.isImage ? (
              <div className="image-preview-container">
                <div className="image-frame">
                  <img
                    id="downloaded-image-preview"
                    src={downloadedResult.blobUrl}
                    alt={downloadedResult.filename || downloadedResult.imageId}
                  />
                </div>

                <div className="result-actions">
                  <a
                    href={downloadedResult.blobUrl}
                    download={downloadedResult.filename}
                    className="download-link-btn"
                  >
                    <FileDown size={16} />
                    <span>Download Image File</span>
                  </a>
                  <a
                    href={downloadedResult.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action-small"
                  >
                    <ExternalLink size={14} />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>
            ) : (
              /* 7. Provide a download link for non-image files */
              <div className="non-image-box">
                <div className="non-image-icon">
                  <FileDown size={28} />
                </div>
                <div>
                  <div className="non-image-name">{downloadedResult.filename}</div>
                  <div className="non-image-meta">
                    Type: <code className="font-mono">{downloadedResult.contentType}</code> • Size: {formatFileSize(downloadedResult.size)}
                  </div>
                </div>

                <a
                  id="non-image-download-link"
                  href={downloadedResult.blobUrl}
                  download={downloadedResult.filename}
                  className="download-link-btn"
                >
                  <FileDown size={18} />
                  <span>Download File ({formatFileSize(downloadedResult.size)})</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
