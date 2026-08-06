import React, { useState } from 'react';
import { convertAndZipServer, downloadZipFromBackend } from '../services/api';
import AlertModal from './AlertModal';

export default function RecentBatches({ batches = [], onDeleteBatch }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  if (!batches || batches.length === 0) return null;

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDownloadBatchZip = async (batch) => {
    setDownloadingId(batch.id);
    try {
      if (batch.files && batch.files.length > 0) {
        const hasConvertedBlobs = batch.files.some((f) => f.convertedBlob);
        if (hasConvertedBlobs) {
          await downloadZipFromBackend(batch.files);
        } else {
          await convertAndZipServer(batch.files);
        }
      } else {
        const response = await fetch(`/api/batches/${batch.id}/download`);
        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `kompresin-${batch.id}.zip`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(downloadUrl);
        }
      }
    } catch (err) {
      console.error('Failed to download batch ZIP:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (batchId) => {
    if (onDeleteBatch) {
      onDeleteBatch(batchId);
      setModalConfig({
        isOpen: true,
        title: 'Berhasil Hapus',
        message: 'Batch berhasil dihapus!',
        type: 'success'
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mt-lg">
      <AlertModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={closeModal}
      />

      <h3 className="font-label text-label text-on-surface-variant uppercase tracking-wider mb-sm px-md">
        Recent Conversion Batches
      </h3>
      <div className="flex flex-col gap-xs">
        {batches.map((batch) => {
          const fileCountNum = batch.filesCount ?? batch.fileCount ?? 1;
          const isDownloading = downloadingId === batch.id;

          return (
            <div
              key={batch.id}
              className="flex items-center justify-between p-md bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div className="flex flex-col gap-base">
                <span className="font-body text-body font-medium text-on-surface font-mono">
                  {batch.name || `Batch #${batch.id}`}
                </span>
                <div className="flex items-center gap-sm font-body-sm text-body-sm text-on-surface-variant">
                  <span>{fileCountNum} {fileCountNum === 1 ? 'file' : 'files'}</span>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <button
                  type="button"
                  aria-label="Download batch ZIP"
                  onClick={() => handleDownloadBatchZip(batch)}
                  disabled={isDownloading}
                  className="p-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                  title="Download batch images as ZIP"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isDownloading ? 'animate-spin' : ''}`}>
                    {isDownloading ? 'progress_activity' : 'folder_zip'}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Delete batch"
                  onClick={() => handleDelete(batch.id)}
                  className="p-xs text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                  title="Delete batch"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
