import React from 'react';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'primary'
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 border-red-500/30';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/25 border-amber-500/30';
      default:
        return 'bg-[#D4AF37] hover:bg-[#B8860B] text-black shadow-lg shadow-amber-500/25 border-[#D4AF37]/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-[var(--industrial-card)] border-2 border-[var(--industrial-border)] rounded-[2rem] p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Top Accent Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] ${
            confirmVariant === 'danger'
              ? 'bg-gradient-to-r from-red-500 to-rose-400'
              : confirmVariant === 'warning'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
              : 'bg-gradient-to-r from-amber-400 to-yellow-200'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-[var(--industrial-text-muted)] hover:text-[var(--industrial-text)] hover:bg-[var(--industrial-text)]/5 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4 mb-4 mt-2">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              confirmVariant === 'danger'
                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {confirmVariant === 'danger' ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--industrial-text)] tracking-tight">
              {title}
            </h3>
            <p className="text-xs font-bold text-[var(--industrial-text-muted)] mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--industrial-border)]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-black text-[var(--industrial-text-muted)] hover:text-[var(--industrial-text)] hover:bg-[var(--industrial-text)]/5 border border-[var(--industrial-border)] transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center border ${getVariantStyles()}`}
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
