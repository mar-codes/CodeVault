'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

const Dropdown = ({ options = [], value, onChange = () => {}, placeholder = "Select an option", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        setPortalContainer(document.body);
      }
    } catch (error) {
      console.error('Failed to initialize portal container:', error);
    }
  }, []);

  useLayoutEffect(() => {
    const updateDropdownPosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownStyle({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          maxHeight: '200px',
          overflowY: 'auto'
        });
      }
    };

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen]);

  const handleOptionClick = (optionValue) => {
    try {
      onChange(optionValue);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to handle option click:', error);
    }
  };

  const selectedOption = Array.isArray(options) ? options.find(opt => opt?.value === value) || options[0] : null;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white hover:border-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all outline-none flex items-center justify-between"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && portalContainer && createPortal(
        <div 
          className="fixed inset-0"
          style={{ zIndex: 9999 }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute bg-gray-800/95 border border-gray-700 rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm"
            style={dropdownStyle}
            onClick={e => e.stopPropagation()}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-700/50 transition-colors
                  ${value === option.value ? 'bg-blue-900/30 text-blue-300' : 'text-white'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>,
        portalContainer
      )}
    </div>
  );
};

export default Dropdown;
