/**
 * API Service for interacting with Flask Backend endpoints
 * based on the OpenAPI / Swagger spec.
 */

const API_BASE = '/api';

/**
 * Check backend health status & WebP engine support
 * GET /api/health
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) return { healthy: false };
    const data = await response.json();
    return { healthy: true, ...data };
  } catch (err) {
    console.warn('Backend API healthcheck failed:', err.message);
    return { healthy: false };
  }
}

/**
 * Fetch all batch history records from backend
 * GET /api/batches
 */
export async function fetchBatches() {
  try {
    const response = await fetch(`${API_BASE}/batches`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('Failed to fetch batches from backend API:', err.message);
    return null; // Return null so app can fallback to local state if server offline
  }
}

/**
 * Save new batch record to backend
 * POST /api/batches
 * Body: { id: string, filesCount: number, totalSavedBytes: number }
 */
export async function createBatchRecord(batchData) {
  try {
    const response = await fetch(`${API_BASE}/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: batchData.id,
        filesCount: batchData.filesCount,
        totalSavedBytes: batchData.totalSavedBytes
      })
    });
    return response.ok;
  } catch (err) {
    console.warn('Failed to save batch record to backend:', err.message);
    return false;
  }
}

/**
 * Delete a batch record from backend by ID
 * DELETE /api/batches/{batch_id}
 */
export async function deleteBatchRecord(batchId) {
  try {
    const response = await fetch(`${API_BASE}/batches/${batchId}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (err) {
    console.warn('Failed to delete batch record from backend:', err.message);
    return false;
  }
}

/**
 * Package converted image files into a ZIP archive via backend
 * POST /api/download-zip
 * Multipart Form Data: files (file blobs)
 */
export async function downloadZipFromBackend(convertedFiles) {
  const formData = new FormData();
  convertedFiles.forEach((item) => {
    if (item.convertedBlob) {
      formData.append('files', item.convertedBlob, item.convertedFileName);
    }
  });

  const response = await fetch(`${API_BASE}/download-zip`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Failed to generate ZIP from server. Status: ${response.status}`);
  }

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `kompresin-batch-${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Server-side conversion & ZIP download (Original files -> Server -> WebP ZIP)
 * POST /api/convert-and-zip
 * Multipart Form Data: files, quality
 */
export async function convertAndZipServer(files, quality = 80) {
  const formData = new FormData();
  files.forEach((item) => {
    formData.append('files', item.file || item, item.originalName || item.name);
  });
  formData.append('quality', quality);

  const response = await fetch(`${API_BASE}/convert-and-zip`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Server conversion failed. Status: ${response.status}`);
  }

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `kompresin-converted-${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(downloadUrl);
}
