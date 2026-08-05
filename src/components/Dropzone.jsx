import React, { useRef, useState } from 'react';

export default function Dropzone({ onFilesSelected, isConverting }) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (!isConverting && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/webp'
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleClick = () => {
    if (!isConverting && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      onFilesSelected(selected);
      // Reset input value so re-selecting same file works
      e.target.value = '';
    }
  };

  return (
    <div
      id="dropzone"
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed border-outline-variant rounded-lg p-xl flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer mb-md relative z-0 ${
        isDragActive ? 'drag-active bg-surface-container-low' : 'bg-surface-bright hover:bg-surface-container-low'
      }`}
    >
      <span
        className="material-symbols-outlined text-[48px] text-outline mb-sm"
        style={{ fontVariationSettings: "'FILL' 0" }}
      >
        cloud_upload
      </span>
      <p className="font-body text-body text-on-surface font-medium mb-xs">
        Drag &amp; drop your JPG or PNG images here
      </p>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
        Instant local conversion to WebP format
      </p>
      <button
        type="button"
        className="bg-surface-container-lowest border border-outline-variant text-on-surface px-md py-xs rounded hover:bg-surface-container-low transition-colors font-label text-label"
      >
        Browse Files
      </button>
      <input
        ref={fileInputRef}
        type="file"
        id="fileInput"
        accept="image/jpeg, image/png, image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
