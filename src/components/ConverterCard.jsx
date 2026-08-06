import React, { useState, useRef } from 'react';
import Dropzone from './Dropzone';
import FileQueue from './FileQueue';
import { formatBytes } from '../utils/formatters';
import { convertAndZipServer, createBatchRecord } from '../services/api';

export default function ConverterCard({ onBatchCompleted }) {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(80);
  const [isConverting, setIsConverting] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [animOpacity, setAnimOpacity] = useState(false);

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

  // Perform 100% Server-Side Flask Conversion (POST /api/convert-and-zip)
  const handleConvertServer = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setProgress(30);

    try {
      // Send original files to Flask API /api/convert-and-zip
      setProgress(60);
      await convertAndZipServer(files, quality);
      setProgress(100);

      const convertedList = files.map((item) => ({
        ...item,
        status: 'converted'
      }));

      setFiles(convertedList);
      setIsConverted(true);

      // Trigger success animations
      setShowSuccessAnim(true);
      setTimeout(() => setAnimOpacity(true), 10);
      createParticles();

      setTimeout(() => {
        setAnimOpacity(false);
        setTimeout(() => setShowSuccessAnim(false), 300);
      }, 1200);

      // Build batch payload matching OpenAPI Swagger spec
      const batchId = `batch-${Date.now()}`;
      const batchPayload = {
        id: batchId,
        filesCount: files.length,
        totalSavedBytes: 0,
        name: `Batch #${batchId.slice(-4)}`,
        files: convertedList
      };

      // Save batch record to Flask backend API (POST /api/batches)
      await createBatchRecord(batchPayload);

      if (onBatchCompleted) {
        onBatchCompleted(batchPayload);
      }
    } catch (err) {
      console.error('Server conversion error:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setIsConverted(false);
    setIsConverting(false);
    setProgress(0);
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
          {isConverted && (
            <div className="bg-surface-container-low border border-outline-variant p-sm rounded-lg flex items-center justify-between text-body-sm">
              <span className="text-on-surface font-medium">Conversion Complete! ZIP Downloaded.</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-sm mt-sm">
            {!isConverted ? (
              <button
                type="button"
                onClick={handleConvertServer}
                disabled={isConverting || files.length === 0}
                className="w-full bg-primary text-on-primary font-label text-label py-sm rounded hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-xs disabled:opacity-50 cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[18px] ${isConverting ? 'animate-spin' : ''}`}>
                  {isConverting ? 'progress_activity' : 'bolt'}
                </span>
                <span>
                  {isConverting
                    ? `Converting via Flask (${progress}%)...`
                    : `Convert ${files.length} File${files.length > 1 ? 's' : ''} to WebP (ZIP)`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="w-full bg-surface-container-high text-on-surface font-label text-label py-sm rounded hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Convert More Files</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
