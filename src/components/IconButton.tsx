import { css } from 'astroturf';
import { forwardRef, MouseEventHandler, ReactElement, ReactNode } from 'react';
import { cn } from '../helpers';

interface Props {
  label: string;
  disabled?: boolean;
  dark?: boolean;
  className?: string;
  headerButton?: boolean;
  icon?: ReactElement;
  onClick?: MouseEventHandler;
  children?: ReactNode;
}

export default forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { icon, children, label, dark, headerButton, className, ...restProps } = props;

  const classes = cn(styles.button, dark && styles.dark, headerButton && styles.headerButton, className);

  return (
    <button
      {...restProps}
      ref={ref}
      type="button"
      className={classes}
      aria-label={label}
      title={label}
    >
      <div className={styles.icon} aria-hidden="true">
        {icon}
      </div>
    </button>
  );
});

const styles = css`
  @import '../variables.scss';

  .button {
    background: none;
    border: none;
    padding: $unit-half;
    display: inline-block;
    color: $color-primary;
    transition: background 0.1s ease-in-out;
    border-radius: $unit-half;
    position: relative;
    cursor: pointer;
    width: $unit-4;
    height: $unit-4;
    font-size: 1em;

    &:hover,
    &:focus {
      background: rgba(0, 0, 0, 0.1);
    }

    &.dark {
      background: $color-border;
    }

    &.headerButton svg {
      stroke-width: 3px;
      color: $color-light;
    }

    &.headerButton:hover,
    &.headerButton:focus {
      background: rgb(239, 246, 245);

      svg {
      color: $color-primary;
      }
    }

    svg {
      width: 1em;
      height: 1em;
      display: block;
      opacity: 0.6;
    }
  }

  .icon {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`;
