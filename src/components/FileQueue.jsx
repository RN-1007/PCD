import React from 'react';

export default function FileQueue({ files, isConverted, isConverting, onRemoveFile }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="flex flex-col gap-base">
      <div className="flex justify-between items-center mb-xs">
        <h3 className="font-label text-label text-on-surface-variant uppercase tracking-wider">
          Files queued ({files.length})
        </h3>
      </div>
      
      {files.map((item) => {
        let statusBadge;
        if (item.status === 'converted' || isConverted) {
          statusBadge = (
            <span className="font-label text-label bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-400">
              Success
            </span>
          );
        } else if (item.status === 'converting' || isConverting) {
          statusBadge = (
            <span className="font-label text-label bg-blue-100 text-blue-800 px-2 py-1 rounded animate-pulse">
              Processing...
            </span>
          );
        } else {
          statusBadge = (
            <span className="font-label text-label bg-surface-container-low text-on-surface-variant px-2 py-1 rounded">
              Ready
            </span>
          );
        }

        return (
          <div
            key={item.id}
            className="flex justify-between items-center py-xs border-b border-surface-container-high last:border-0 gap-sm"
          >
            <div className="flex items-center gap-sm min-w-0 flex-1">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant flex-shrink-0">
                image
              </span>
              <span className="font-mono text-mono text-on-surface truncate" title={item.originalName}>
                {item.originalName}
              </span>
            </div>

            <div className="flex items-center gap-sm flex-shrink-0">
              <span className="font-mono text-mono text-on-surface-variant text-[11px]">
                {item.convertedSizeFormatted ? (
                  <>
                    <span className="line-through text-outline mr-1">{item.originalSizeFormatted}</span>
                    <span className="text-on-surface font-medium">{item.convertedSizeFormatted}</span>
                  </>
                ) : (
                  item.originalSizeFormatted
                )}
              </span>

              {statusBadge}

              {/* Individual File Download WebP button */}
              {item.convertedUrl && (
                <a
                  href={item.convertedUrl}
                  download={item.convertedFileName}
                  className="p-1 text-on-surface-variant hover:text-primary transition-colors flex items-center"
                  title={`Download ${item.convertedFileName}`}
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </a>
              )}

              {/* Remove item button if not converting */}
              {!isConverting && !isConverted && onRemoveFile && (
                <button
                  type="button"
                  onClick={() => onRemoveFile(item.id)}
                  className="p-1 text-on-surface-variant hover:text-error transition-colors flex items-center"
                  title="Remove file"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
