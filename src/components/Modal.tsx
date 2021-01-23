import { css } from 'astroturf';
import { KeyboardEventHandler, MouseEventHandler, ReactNode, useEffect, useRef } from 'react';
import { useModal } from '../hooks/useModal';

interface Props {
  children: ReactNode;
}

export default function Modal(props: Props) {
  const [, setModalContent] = useModal();
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    lastActiveElement.current = document.activeElement;

    const tabbables = findTabbableElements(dialogRef.current as Element);
    if (tabbables.length) {
      (tabbables[0] as HTMLElement).focus();
    }

    return () => {
      if (lastActiveElement.current) {
        (lastActiveElement.current as HTMLElement).focus();
      }

      lastActiveElement.current = null;
    };
  }, []);

  const handleKeyDown: KeyboardEventHandler = (evt) => {
    if (evt.key === 'Tab') {
      const tabbables = findTabbableElements(dialogRef.current as Element);
      const activeElement = document.activeElement;

      if (!evt.shiftKey) {
        if (activeElement === tabbables[tabbables.length - 1]) {
          evt.preventDefault();
          (tabbables[0] as HTMLElement).focus();
        }
      } else {
        if (activeElement === tabbables[0]) {
          evt.preventDefault();
          (tabbables[tabbables.length - 1] as HTMLElement).focus();
        }
      }
    } else if (evt.key === 'Escape') {
      setModalContent(null);
    }
  };

  const handleClick: MouseEventHandler = (evt) => {
    if (dialogRef.current && !dialogRef.current.contains(evt.target as Node)) {
      setModalContent(null);
    }
  };

  return (
    <div className={styles.backdrop} onMouseDown={handleClick}>
      <div className={styles.dialog} role="dialog" ref={dialogRef} onKeyDown={handleKeyDown}>
        {props.children}
      </div>
    </div>
  );
}

function findTabbableElements(el: Element) {
  if (!el) return [];

  return Array.from(
    el.querySelectorAll(
      '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

const styles = css`
  @import '../variables.scss';

  .backdrop {
    z-index: 999;
    background: rgba(var(--color-box-shadow), 0.4);
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dialog {
    background: var(--color-theme);
    border-radius: $unit-half;
    box-shadow: 0 0 $unit-2 0px rgba(0, 0, 0, 0.2);
    min-width: 400px;
    max-width: 90%;
  }
`;
