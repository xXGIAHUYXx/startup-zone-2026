import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useSwipeDismiss } from '../../hooks/useSwipeDismiss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const { panel, scrim, handlers } = useSwipeDismiss(isOpen, onClose);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        ref={scrim}
        className="fixed inset-0 bg-black/30 backdrop-blur-md animate-scrim"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        ref={panel}
        className={`relative w-full ${maxWidthClasses[maxWidth]} glass-thick rounded-[1.75rem] overflow-hidden z-10 animate-materialize my-8`}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-[#86868b]/40 pointer-events-none" />
        {/* Header — vuốt xuống ở đây để đóng */}
        <div {...handlers} className="flex items-start justify-between px-6 pt-7 pb-4 border-b border-black/[0.06] touch-none cursor-grab active:cursor-grabbing">
          <div>
            <span className="text-[13px] text-[#6e6e73] font-medium block mb-1">
              Made in Vietnam Lab · Bản demo
            </span>
            <h3 className="text-2xl sm:text-[1.75rem] font-semibold font-heritage text-[#1d1d1f]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#6e6e73] mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 shrink-0 grid place-items-center rounded-full bg-black/5 text-[#6e6e73] hover:bg-black/10 hover:text-[#1d1d1f] cursor-pointer"
            aria-label="Đóng"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
