import React from 'react';

export default function Footer() {
  return (
    <footer class="w-full py-md border-t border-outline-variant bg-background flex flex-col md:flex-row justify-between items-center px-gutter max-w-container-max mx-auto gap-xs mt-auto">
      <span class="font-h3 text-h3 font-bold text-primary">Kompresin</span>
      <span class="font-body-sm text-body-sm text-secondary">
        © 2024 Kompresin. Built for performance.
      </span>
      <div class="flex gap-md font-body-sm text-body-sm text-secondary">
        <a class="hover:text-primary transition-colors" href="#">
          Privacy
        </a>
        <a class="hover:text-primary transition-colors" href="#">
          Terms
        </a>
        <a class="hover:text-primary transition-colors" href="#">
          API
        </a>
      </div>
    </footer>
  );
}
