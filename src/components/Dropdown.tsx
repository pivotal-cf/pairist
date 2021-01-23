import { css } from 'astroturf';
import { cloneElement, ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '../helpers';

interface Props {
  align?: 'left' | 'right';
  trigger: ReactElement;
  children: ReactNode;
}

export default function Dropdown(props: Props) {
  const { align = 'left' } = props;
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const menuClass = cn(styles.menu, styles[align]);

  const trigger = cloneElement(props.trigger, {
    'aria-haspopup': true,
    'aria-expanded': expanded,
    ref: triggerRef,
    onClick: () => setExpanded(!expanded),
  });

  useEffect(() => {
    const handleWindowClick = (evt: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(evt.target as Node)) {
        setExpanded(false);
      }
    };

    const handleKeyPress = (evt: KeyboardEvent) => {
      if (evt.keyCode === 27) {
        setExpanded(false);

        if (triggerRef.current) {
          triggerRef.current.focus();
        }
      }
    };

    if (expanded) {
      window.addEventListener('keydown', handleKeyPress);
      window.addEventListener('click', handleWindowClick);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleWindowClick);
    };
  }, [expanded]);

  return (
    <div className={styles.container} ref={containerRef}>
      {trigger}
      {expanded && (
        <ul className={menuClass} role="menu">
          {props.children}
        </ul>
      )}
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .container {
    position: relative;
    z-index: 999;
  }

  .menu {
    position: absolute;
    z-index: 999;
    top: calc(100% - 2px);
    background: var(--color-theme);
    border-radius: $unit-half;
    box-shadow: 0 0 8px 0px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 0;
    margin: 0;
    width: max-content;
  }

  .left {
    left: $unit;
  }

  .right {
    right: $unit;
  }
`;
