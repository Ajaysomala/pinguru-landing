import { useEffect, useRef } from 'react';

/**
 * Focus trap hook for accessible modal dialogs
 * - Stores previous activeElement on open and restores it on close
 * - Moves focus to first focusable element inside the modal on open
 * - Wraps Tab / Shift+Tab at the boundary
 * - Listens for Escape key to close the modal
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose?: () => void
) {
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Store the element that triggered the modal open
    triggerElementRef.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    if (!container) return;

    const getFocusableElements = () => {
      if (!container) return [];
      const selector =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0
      );
    };

    // 2. Move focus inside the modal on open
    const timer = setTimeout(() => {
      const focusables = getFocusableElements();
      if (focusables.length > 0) {
        const autoFocusEl = focusables.find((el) => el.hasAttribute('autofocus'));
        (autoFocusEl || focusables[0]).focus();
      } else {
        container.focus();
      }
    }, 50);

    // 3. Handle keyboard boundary trapping & Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = getFocusableElements();
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !container.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !container.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown, true);
      // 4. Return focus to the trigger element when modal closes
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        requestAnimationFrame(() => {
          triggerElementRef.current?.focus();
        });
      }
    };
  }, [isOpen, onClose, containerRef]);

  return triggerElementRef;
}
