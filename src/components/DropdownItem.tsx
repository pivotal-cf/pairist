import { css } from 'astroturf';
import { MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  href?: string;
  leftIcon?: ReactNode;
  onClick?: MouseEventHandler;
  children?: ReactNode;
}

export default function DropdownItem(props: Props) {
  const { leftIcon, href, children, ...rest } = props;

  return (
    <li className={styles.item}>
      {href ? (
        <Link {...rest} className={styles.button} to={href}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          {children}
        </Link>
      ) : (
        <button {...rest} className={styles.button}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          {children}
        </button>
      )}
    </li>
  );
}

const styles = css`
  @import '../variables.scss';

  .item {
    list-style-type: none;
    min-width: 100%;
    display: flex;
    align-items: center;
  }

  .button {
    display: inline-block;
    text-decoration: none;
    background: none;
    border: none;
    font-size: inherit;
    font-family: inherit;
    padding: $unit;
    cursor: pointer;
    min-width: 100%;
    text-align: left;

    &:hover,
    &:focus {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .leftIcon {
    margin-right: $unit;
  }
`;
