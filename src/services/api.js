/**
 * EventSphere API Client
 * Communicates EXCLUSIVELY with the Spring Boot REST Microservice.
 * Configured via Vite environment variable VITE_API_BASE_URL.
 * Does NOT connect directly to AWS S3.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8087';

/**
 * Check backend microservice health status.
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Cannot reach Spring Boot backend at ${API_BASE_URL}. Ensure it is running on port 8087.`);
  }
}

/**
 * Upload a file to Spring Boot backend: POST /upload
 * @param {string} imageId - Unique ID for the file/image
 * @param {File} file - The file to upload
 */
export async function uploadFile(imageId, file) {
  if (!imageId || !imageId.trim()) {
    throw new Error('Please enter a valid Image/File ID.');
  }
  if (!file) {
    throw new Error('Please select a file to upload.');
  }

  const formData = new FormData();
  formData.append('imageId', imageId.trim());
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Upload failed with status code ${response.status}`);
  }

  return data;
}

/**
 * Download a file from Spring Boot backend: GET /download/{imageId}
 * @param {string} imageId - ID of the file to retrieve
 */
export async function downloadFile(imageId) {
  if (!imageId || !imageId.trim()) {
    throw new Error('Please enter an Image/File ID to download.');
  }

  const cleanId = encodeURIComponent(imageId.trim());
  const response = await fetch(`${API_BASE_URL}/download/${cleanId}`, {
    method: 'GET',
  });

  if (response.status === 404) {
    let errorMsg = `Object with ID '${imageId}' was not found in S3 (eventsphere/${imageId}).`;
    try {
      const errJson = await response.json();
      if (errJson.message) errorMsg = errJson.message;
    } catch {
      // ignore JSON parse error on 404
    }
    const err = new Error(errorMsg);
    err.status = 404;
    throw err;
  }

  if (!response.ok) {
    let errorMsg = `Failed to download file (Status ${response.status}).`;
    try {
      const errJson = await response.json();
      if (errJson.message) errorMsg = errJson.message;
    } catch {
      // ignore
    }
    const err = new Error(errorMsg);
    err.status = response.status;
    throw err;
  }

  // Extract Content-Type header
  const rawContentType = response.headers.get('content-type') || 'application/octet-stream';
  const contentType = rawContentType.split(';')[0].trim().toLowerCase();

  // Extract filename if provided in X-Original-Filename or Content-Disposition
  let filename = response.headers.get('x-original-filename');
  if (!filename) {
    const disposition = response.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
    }
  }
  if (!filename) {
    filename = imageId;
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const isImage = contentType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(filename);

  return {
    imageId,
    blob,
    blobUrl,
    contentType,
    filename,
    size: blob.size,
    isImage,
  };
}

export { API_BASE_URL };
