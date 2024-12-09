import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './CustomPop.module.css';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  referenceElement?: HTMLElement | null;
  hasBackdrop?: boolean;
}

export function CustomPopup({ isOpen, onClose, children, referenceElement, hasBackdrop = false }: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const mapContainer = document.getElementById('mapContainer');

  const calculatePosition = useCallback(() => {
    if (!referenceElement || !popupRef.current || hasBackdrop) return { top: 0, left: 0 };

    const referenceRect = referenceElement.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();
    const containerRect = mapContainer?.getBoundingClientRect() ?? { top: 0, bottom: Infinity };
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = referenceRect.top + scrollY;
    let left = referenceRect.left + 38;

    // Adjust position if popup goes beyond the container's bottom
    if (top + popupRect.height > containerRect.bottom + scrollY - 60) {
      // top = containerRect.top - popupRect.height + scrollY;
      top = containerRect.bottom - popupRect.height - 60;
    }

    // Adjust position if popup goes beyond the viewport's right edge
    if (left + popupRect.width > window.innerWidth + scrollX) {
      left = referenceRect.right - popupRect.width + scrollX;
    }

    return { top, left };
  }, [referenceElement, hasBackdrop, mapContainer]);

  const updatePosition = useCallback(() => {
    const newPosition = calculatePosition();
    if (newPosition && (!position || newPosition.top !== position.top || newPosition.left !== position.left)) {
      setPosition(newPosition);
    }
  }, [calculatePosition, position]);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const handleScrollResize = () => updatePosition();

    window.addEventListener('scroll', handleScrollResize, true);
    window.addEventListener('resize', handleScrollResize);

    return () => {
      window.removeEventListener('scroll', handleScrollResize, true);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        (!referenceElement || !referenceElement.contains(event.target as Node))
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, referenceElement]);

  if (!isOpen || !position) return null;

  return createPortal(
    <>
      {hasBackdrop && <div className={styles.backdrop} onClick={onClose} />}
      <div
        onClick={e => e.stopPropagation()}
        ref={popupRef}
        style={
          hasBackdrop
            ? undefined
            : {
                position: 'absolute',
                top: `${position.top}px`,
                left: `${position.left}px`
              }
        }
        className={`${styles.popup} ${hasBackdrop ? styles.centered : styles.contextual}`}
      >
        <div className={styles.popupContent}>{children}</div>
      </div>
    </>,
    document.body
  );
}
