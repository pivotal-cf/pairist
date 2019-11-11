import { css } from 'astroturf';
import React, { useLayoutEffect, useRef } from 'react';
import { cn } from '../helpers';

interface Props {
  autofocus?: boolean;
  id?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  readOnly?: boolean;
  placeholder?: string;
  onEnter?: () => any;
  onBlur?: React.FocusEventHandler;
}

function calculateRows(node: HTMLTextAreaElement | null) {
  if (!node) return 1;
  const lineHeight = 18;
  node.rows = 1;
  const rows = Math.max(1, Math.min(node.scrollHeight / lineHeight));
  node.rows = rows;
  return rows;
}

export default function Textarea(props: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (props.autofocus && ref.current) {
      ref.current.selectionStart = ref.current.value.length;
      ref.current.focus();
      calculateRows(ref.current);
    }
  }, [props.autofocus]);

  function onKeyPress(evt: React.KeyboardEvent) {
    if (evt.key === 'Enter' && props.onEnter) {
      evt.preventDefault();
      props.onEnter();
    }
  }

  const rows = calculateRows(ref.current);

  return (
    <textarea
      ref={ref}
      className={cn(styles.textarea, props.className)}
      id={props.id}
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={props.onChange}
      disabled={props.disabled}
      readOnly={props.readOnly}
      placeholder={props.placeholder}
      rows={rows}
      onKeyPress={onKeyPress}
      onBlur={props.onBlur}
    />
  );
}

const styles = css`
  @import '../variables.scss';

  .label {
    font-weight: bold;
    display: block;
    margin-bottom: $unit-half;
  }

  .textarea {
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
    resize: none;
  }

  .container + .container {
    margin-top: $unit-2;
  }
`;
