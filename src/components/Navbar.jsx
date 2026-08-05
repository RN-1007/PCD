import React from 'react';

export default function Navbar() {
  return (
    <header class="w-full h-16 border-b border-outline-variant bg-background flex justify-between items-center px-gutter max-w-container-max mx-auto flat no shadows transition-all duration-200 ease-in-out">
      <div class="flex items-center gap-xs">
        <span class="font-h2 text-h2 font-black tracking-tighter text-primary">Kompresin</span>
      </div>
      <div class="flex items-center gap-md text-on-surface-variant font-body text-body">
        <div class="hidden md:flex gap-sm">
          {/* Navigation links */}
        </div>
      </div>
      <div class="flex items-center gap-sm">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View Source code"
          class="text-on-surface-variant hover:opacity-70 transition-opacity flex items-center gap-1 text-body-sm font-medium"
        >
          <span class="material-symbols-outlined text-[20px]">code</span>
          <span class="hidden sm:inline">Source Code</span>
        </a>
      </div>
    </header>
  );
}
