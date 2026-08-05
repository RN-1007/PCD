import React from 'react';

export default function RecentBatches({ batches = [], onDeleteBatch }) {
  if (!batches || batches.length === 0) return null;

  const handleDownloadBatch = (batch) => {
    if (batch.files && batch.files.length > 0) {
      batch.files.forEach((f) => {
        if (f.convertedUrl) {
          const a = document.createElement('a');
          a.href = f.convertedUrl;
          a.download = f.convertedFileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      });
    } else {
      alert(`Downloading ${batch.name}...`);
    }
  };

  return (
    <div className="w-full max-w-2xl mt-lg">
      <h3 className="font-label text-label text-on-surface-variant uppercase tracking-wider mb-sm px-md">
        Recent Conversion Batches
      </h3>
      <div className="flex flex-col gap-xs">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="flex items-center justify-between p-md bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
          >
            <div className="flex flex-col gap-base">
              <span className="font-body text-body font-medium text-on-surface">{batch.name}</span>
              <div className="flex items-center gap-sm font-body-sm text-body-sm text-on-surface-variant">
                <span>{batch.fileCount} {batch.fileCount === 1 ? 'file' : 'files'}</span>
                <span className="w-1 h-1 bg-outline-variant rounded-full" />
                <span className="text-primary font-medium">Saved {batch.savedSize}</span>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <button
                type="button"
                aria-label="Download batch"
                onClick={() => handleDownloadBatch(batch)}
                className="p-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                title="Download batch images"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
              </button>
              <button
                type="button"
                aria-label="Delete batch"
                onClick={() => onDeleteBatch && onDeleteBatch(batch.id)}
                className="p-xs text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                title="Delete batch"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
