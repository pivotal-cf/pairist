import { css } from 'astroturf';
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../helpers';

interface Props {
  bold?: boolean;
  disabled?: boolean;
  href?: string;
  icon?: React.ReactElement;
  leftIcon?: React.ReactElement;
  onClick?: React.MouseEventHandler;
  flavor?: 'confirm' | 'danger';
  type?: 'submit' | 'button';
  children: React.ReactNode;
  submitting?: boolean;
  className?: string;
  submittingText?: string;
  style?: object;
}

export default function Button(props: Props) {
  const {
    bold,
    icon,
    leftIcon,
    children,
    href,
    type = 'button',
    submitting,
    submittingText,
    className,
    ...restProps
  } = props;

  const fullClassName = cn(
    styles.button,
    props.bold && styles.bold,
    props.flavor && styles[props.flavor],
    className
  );

  if (href) {
    return (
      <Link to={href} {...restProps} className={fullClassName}>
        {submitting ? submittingText || 'Saving...' : children}
        {icon && (
          <div className={styles.icon} aria-hidden="true">
            {icon}
          </div>
        )}
      </Link>
    );
  }

  return (
    <button {...restProps} type={type} className={fullClassName}>
      {leftIcon && (
        <div className={styles.leftIcon} aria-hidden="true">
          {leftIcon}
        </div>
      )}
      {submitting ? submittingText || 'Saving...' : children}
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
    </button>
  );
}

const styles = css`
  @import '../variables.scss';

  .button {
    background: rgba(0, 0, 0, 0.05);
    border: none;
    padding: $unit;
    display: inline-flex;
    color: inherit;
    transition: background 0.1s ease-in-out;
    border-radius: $unit-half;
    font-size: inherit;
    align-items: center;
    text-decoration: none;
    cursor: pointer;

    &:disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    &:hover,
    &:focus {
      background: rgba(0, 0, 0, 0.1);
    }

    &.bold {
      font-weight: bold;
    }

    &.confirm {
      background: transparentize($color-secondary, 0.95);
      color: $color-secondary;

      &:hover,
      &:focus {
        background: transparentize($color-secondary, 0.9);
      }
    }

    &.danger {
      background: transparentize($color-danger, 0.95);
      color: $color-danger;

      &:hover,
      &:focus {
        background: transparentize($color-danger, 0.9);
      }
    }
  }

  svg {
    height: 0.8em;
    width: 0.8em;
    vertical-align: -0.1em;
  }

  .image {
    width: 1em;
    height: 1em;
    margin-right: $unit;
    border-radius: $unit-half;
  }

  .icon {
    margin-left: $unit-half;
  }

  .leftIcon {
    margin-right: $unit-half;
  }

  .menu {
    position: absolute;
    top: 100%;
    border-radius: $unit-half;
    color: initial;
    padding: $unit;
    box-shadow: 0 0 $unit rgba(0, 0, 0, 0.2);

    &.leftMenu {
      left: $unit;
    }

    &.rightMenu {
      right: $unit;
    }
  }
`;
