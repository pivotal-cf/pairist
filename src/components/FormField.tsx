import { css } from 'astroturf';
import React from 'react';
import { cn } from '../helpers';

interface Props {
  label?: string;
  helpText?: string;
  children: React.ReactElement;
  grow?: boolean;
}

export default function FormField(props: Props) {
  const id = props.children.props.id;
  const className = cn(styles.container, props.grow && styles.grow);

  return (
    <div className={className}>
      {props.label && (
        <label className={styles.label} htmlFor={id}>
          {props.label}
        </label>
      )}

      {props.children}
      {props.helpText && <small>{props.helpText}</small>}
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .grow {
    flex-grow: 1;
  }

  .label {
    font-weight: bold;
    display: block;
    margin-bottom: $unit-half;
  }

  .container:not(:first-child) {
    margin-top: $unit-2;
  }
`;
