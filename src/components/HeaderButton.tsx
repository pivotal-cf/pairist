import { css } from 'astroturf';
import React, { ReactNode } from 'react';
import { cn } from '../helpers';

interface Props {
  bold?: boolean;
  imageURL?: string;
  imageHash?: string;
  disabled?: boolean;
  icon?: React.ReactElement;
  onClick?: React.MouseEventHandler;
  content: ReactNode;
}

export default React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { bold, imageURL, imageHash, content, icon, ...restProps } = props;
  const className = cn(styles.headerButton, props.bold && styles.bold);

  return (
    <button {...restProps} className={className} ref={ref}>
      {imageURL ? (
        <img className={styles.image} src={imageURL} alt="" />
      ) : imageHash ? (
        <svg className={styles.image} width="80" height="80" data-jdenticon-value={imageHash} />
      ) : null}
      <div>{content}</div>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
    </button>
  );
});

const styles = css`
  .headerButton {
    background: none;
    border: none;
    padding: 8px;
    margin: 8px;
    display: flex;
    color: inherit;
    transition: background 0.1s ease-in-out;
    border-radius: 4px;
    font-size: inherit;
    align-items: center;
    cursor: pointer;
    position: relative;

    &:disabled {
      pointer-events: none;
    }

    &:hover,
    &:focus {
      background: rgba(255, 255, 255, 0.1);
    }

    &.bold {
      font-weight: bold;
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
    margin-right: 8px;
    border-radius: 2px;
    background-color: white;
  }

  .icon {
    margin-left: 4px;
  }
`;
