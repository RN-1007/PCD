import React, { useState, useRef } from 'react';
import Dropzone from './Dropzone';
import FileQueue from './FileQueue';
import { convertImageToWebP, formatBytes } from '../utils/converter';

export default function ConverterCard({ onBatchCompleted }) {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(80);
  const [isConverting, setIsConverting] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [animOpacity, setAnimOpacity] = useState(false);
  const [totalSavedFormatted, setTotalSavedFormatted] = useState('');
  const [zipLoading, setZipLoading] = useState(false);

  const animationContainerRef = useRef(null);

  // Handle files selected via file input or drag-and-drop
  const handleFilesSelected = (selectedFiles) => {
    const fileEntries = selectedFiles.map((file, idx) => ({
      id: `${file.name}-${Date.now()}-${idx}`,
      file,
      originalName: file.name,
      originalSizeFormatted: formatBytes(file.size),
      originalSizeBytes: file.size,
      status: 'ready'
    }));

    setFiles((prev) => [...prev, ...fileEntries]);
    setIsConverted(false);
  };

  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const createParticles = () => {
    if (!animationContainerRef.current) return;
    const colors = ['#000000', '#444444', '#888888', '#bbbbbb'];
    for (let i = 0; i < 50; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 6 + 3;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = '50%';
      p.style.top = '50%';

      const angle = Math.random() * Math.PI * 2;
      const velocity = 60 + Math.random() * 200;
      const tx = `${Math.cos(angle) * velocity}px`;
      const ty = `${Math.sin(angle) * velocity}px`;

      p.style.setProperty('--tx', tx);
      p.style.setProperty('--ty', ty);

      animationContainerRef.current.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  };

  // Perform REAL Client-Side Canvas WebP Conversion
  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setProgress(0);

    const convertedList = [];
    let totalOriginalBytes = 0;
    let totalConvertedBytes = 0;

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      try {
        const result = await convertImageToWebP(item.file, quality);
        convertedList.push({
          ...item,
          ...result,
          status: 'converted'
        });
        totalOriginalBytes += result.originalSizeBytes;
        totalConvertedBytes += result.convertedSizeBytes;
      } catch (err) {
        console.error('Failed to convert image:', item.originalName, err);
        convertedList.push({
          ...item,
          status: 'error'
        });
      }

      const currentProgress = Math.round(((i + 1) / files.length) * 100);
      setProgress(currentProgress);
    }

    setFiles(convertedList);
    setIsConverting(false);
    setIsConverted(true);

    const totalSavedBytes = Math.max(0, totalOriginalBytes - totalConvertedBytes);
    const savedStr = formatBytes(totalSavedBytes);
    setTotalSavedFormatted(savedStr);

    // Trigger success animations
    setShowSuccessAnim(true);
    setTimeout(() => setAnimOpacity(true), 10);
    createParticles();

    setTimeout(() => {
      setAnimOpacity(false);
      setTimeout(() => setShowSuccessAnim(false), 300);
    }, 1200);

    // Add to Recent Batches if callback provided
    if (onBatchCompleted && convertedList.length > 0) {
      onBatchCompleted({
        id: `batch-${Date.now().toString(36)}`,
        name: `Batch #${Math.floor(Math.random() * 900) + 100} - Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        fileCount: convertedList.length,
        savedSize: savedStr,
        files: convertedList
      });
    }
  };

  // Backend ZIP download handler (sends request to backend API endpoint)
  const handleDownloadZipBackend = async () => {
    setZipLoading(true);
    try {
      // Prepare converted files data or FormData for backend ZIP service
      const formData = new FormData();
      files.forEach((f) => {
        if (f.convertedBlob) {
          formData.append('files', f.convertedBlob, f.convertedFileName);
        }
      });

      // Send to backend API zip endpoint
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `kompresin-batch-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
      } else {
        // Fallback if backend API is not running yet
        alert('Backend ZIP API endpoint (/api/download-zip) ready. Backend backend is not active yet, downloading individual files instead.');
        files.forEach((f) => {
          if (f.convertedUrl) {
            const a = document.createElement('a');
            a.href = f.convertedUrl;
            a.download = f.convertedFileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
          }
        });
      }
    } catch (err) {
      console.warn('Backend ZIP server connection failed, falling back to individual download.', err);
      files.forEach((f) => {
        if (f.convertedUrl) {
          const a = document.createElement('a');
          a.href = f.convertedUrl;
          a.download = f.convertedFileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      });
    } finally {
      setZipLoading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsConverted(false);
    setIsConverting(false);
    setProgress(0);
    setTotalSavedFormatted('');
  };

  return (
    <div className="relative w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-xl p-md overflow-hidden">
      {/* Animation Container */}
      <div
        ref={animationContainerRef}
        className={`absolute inset-0 pointer-events-none flex items-center justify-center z-10 bg-surface-container-lowest/80 backdrop-blur-sm transition-opacity duration-300 ${
          showSuccessAnim ? 'flex' : 'hidden'
        } ${animOpacity ? 'opacity-100' : 'opacity-0'}`}
      >
        <svg
          className={`w-32 h-32 text-primary ${showSuccessAnim ? 'animate-check' : 'hidden'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path className="checkmark-path" d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Dropzone */}
      <Dropzone onFilesSelected={handleFilesSelected} isConverting={isConverting} />

      {/* File Queue & Controls */}
      {files.length > 0 && (
        <div className="flex flex-col gap-md border-t border-outline-variant pt-md relative z-0">
          {/* Quality Slider */}
          <div className="flex flex-col gap-xs">
            <div className="flex justify-between items-center text-body-sm font-label">
              <span className="text-on-surface-variant font-medium">WebP Quality</span>
              <span className="font-mono text-on-surface font-semibold">{quality}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              disabled={isConverting}
              className="custom-slider w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* File Queue List */}
          <FileQueue
            files={files}
            isConverted={isConverted}
            isConverting={isConverting}
            onRemoveFile={handleRemoveFile}
          />

          {/* Progress Bar */}
          {isConverting && (
            <div className="w-full h-1.5 bg-surface-container-high rounded overflow-hidden mt-2">
              <div
                className="h-full bg-primary transition-all duration-200 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Summary Banner after conversion */}
          {isConverted && totalSavedFormatted && (
            <div className="bg-surface-container-low border border-outline-variant p-sm rounded-lg flex items-center justify-between text-body-sm">
              <span className="text-on-surface font-medium">Conversion Complete!</span>
              <span className="text-primary font-semibold">Total Saved: {totalSavedFormatted}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-sm mt-sm">
            {!isConverted ? (
              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting || files.length === 0}
                className="w-full bg-primary text-on-primary font-label text-label py-sm rounded hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-xs disabled:opacity-50 cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[18px] ${isConverting ? 'animate-spin' : ''}`}>
                  {isConverting ? 'progress_activity' : 'bolt'}
                </span>
                <span>{isConverting ? `Converting (${progress}%)...` : `Convert ${files.length} File${files.length > 1 ? 's' : ''} to WebP`}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleDownloadZipBackend}
                  disabled={zipLoading}
                  className="flex-1 bg-primary text-on-primary font-label text-label py-sm rounded hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-xs cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[18px] ${zipLoading ? 'animate-spin' : ''}`}>
                    {zipLoading ? 'progress_activity' : 'folder_zip'}
                  </span>
                  <span>{zipLoading ? 'Requesting ZIP...' : 'Download All (ZIP Backend)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-md bg-surface-container-high text-on-surface font-label text-label py-sm rounded hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-xs cursor-pointer"
                  title="Clear Queue"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  <span>New</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
