import { css } from 'astroturf';
import React from 'react';
import { cn } from '../helpers';

interface Props {
  id?: string;
  className?: string;
  helpText?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  readOnly?: boolean;
  placeholder?: string;
  type?: string;
}

export default function Input(props: Props) {
  return (
    <input
      type={props.type || 'text'}
      className={cn(styles.input, props.className)}
      id={props.id}
      defaultValue={props.defaultValue}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      disabled={props.disabled}
      readOnly={props.readOnly}
      placeholder={props.placeholder}
    />
  );
}

const styles = css`
  @import '../variables.scss';

  .input {
    padding: $unit;
    display: block;
    font-size: inherit;
    font-family: inherit;
    border: none;
    border-radius: $unit-half;
    width: 100%;
    width: stretch;
    min-width: $unit * 30;
    background: rgba(0, 0, 0, 0.05);
  }
`;
