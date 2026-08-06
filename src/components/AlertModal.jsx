import React from 'react';

export default function AlertModal({ isOpen, title, message, type = 'info', onClose }) {
  if (!isOpen) return null;

  let iconName = 'info';
  let iconBgClass = 'bg-surface-container-high text-on-surface';

  if (type === 'success') {
    iconName = 'check_circle';
    iconBgClass = 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400';
  } else if (type === 'error') {
    iconName = 'warning';
    iconBgClass = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-tertiary/40 backdrop-blur-xs animate-fade-scale">
      <div className="relative w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-lg flex flex-col gap-sm">
        <div className="flex items-center gap-sm">
          <div className={`p-xs rounded-full flex items-center justify-center ${iconBgClass}`}>
            <span className="material-symbols-outlined text-[24px]">{iconName}</span>
          </div>
          <h3 className="font-h3 text-h3 font-semibold text-on-surface">{title}</h3>
        </div>

        <p className="font-body text-body text-on-surface-variant leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end mt-xs">
          <button
            type="button"
            onClick={onClose}
            className="bg-primary text-on-primary font-label text-label px-md py-xs rounded hover:opacity-90 transition-opacity cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
