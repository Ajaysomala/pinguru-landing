import { useEffect, useRef } from 'react';

/**
 * Focus trap hook for accessible modal dialogs
 * - Captures the triggering element only when the modal transitions from closed to open
 * - Sets initial focus only on open, without stealing focus if an element inside is already focused
 * - Traps Tab / Shift+Tab within the modal container boundaries
 * - Listens for Escape key to close the modal
 * - Restores focus to the triggering element only when the modal actually closes
 * - Stable against caller re-renders and unmemoized callbacks
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose?: () => void
) {
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const onCloseRef = useRef(onClose);

  // Always keep latest onClose callback without re-triggering effects
  onCloseRef.current = onClose;

  useEffect(() => {
    // Modal transitioned from closed -> open
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      triggerElementRef.current = document.activeElement as HTMLElement | null;

      const container = containerRef.current;
      if (container) {
        // Only set initial focus if focus is not already inside the modal
        if (!container.contains(document.activeElement)) {
          const selector =
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
          const focusables = Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
            (el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0
          );

          if (focusables.length > 0) {
            const autoFocusEl = focusables.find((el) => el.hasAttribute('autofocus'));
            (autoFocusEl || focusables[0]).focus();
          } else {
            container.focus();
          }
        }
      }
    }

    // Modal transitioned from open -> closed
    if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        const el = triggerElementRef.current;
        triggerElementRef.current = null;
        requestAnimationFrame(() => {
          el.focus();
        });
      }
    }
  }, [isOpen, containerRef]);

  // Clean up on unmount if modal was open
  useEffect(() => {
    return () => {
      if (wasOpenRef.current && triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        const el = triggerElementRef.current;
        triggerElementRef.current = null;
        requestAnimationFrame(() => {
          el.focus();
        });
      }
    };
  }, []);

  // Keyboard navigation trap (Tab & Escape) active while open
  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }

      if (e.key === 'Tab') {
        const selector =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusables = Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
          (el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0
        );

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
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, containerRef]);

  return triggerElementRef;
}
