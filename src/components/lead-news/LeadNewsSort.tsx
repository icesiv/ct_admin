import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface LeadNewsSortProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  width?: string;
  children: ReactNode;
  backdrop?: boolean;
  keyboard?: boolean;
}

const LeadNewsSort: React.FC<LeadNewsSortProps> = ({
  isOpen,
  onClose,
  position = 'left',
  width = 'w-80',
  children,
  backdrop = true,
  keyboard = true,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (keyboard && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, keyboard]);

  const getPositionClasses = (): string => {
    const baseClasses = 'fixed top-0 h-full z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out';

    switch (position) {
      case 'right':
        return `${baseClasses} right-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;
      case 'top':
        return `${baseClasses} left-0 w-full h-80 ${isOpen ? 'translate-y-0' : '-translate-y-full'}`;
      case 'bottom':
        return `${baseClasses} left-0 bottom-0 w-full h-80 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`;
      default: // left
        return `${baseClasses} left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`;
    }
  };

  if (!isOpen && !backdrop) return null;

  return (
    <>
      {/* Backdrop */}
      {backdrop && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Offcanvas */}
      <div
        className={`${getPositionClasses()} ${width}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offcanvas-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 id="offcanvas-title" className="text-lg font-semibold text-gray-900">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
};

export default LeadNewsSort;