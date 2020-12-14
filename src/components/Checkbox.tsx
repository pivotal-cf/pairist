import { css } from 'astroturf';
import { ChangeEventHandler } from 'react';
import { cn } from '../helpers';

interface Props {
  id?: string;
  className?: string;
  label?: string;
  value?: boolean;
  readOnly?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export default function Checkbox(props: Props) {
  return (
    <div className={styles.container}>
      <input
        type="checkbox"
        className={cn(styles.input, props.className)}
        id={props.id}
        checked={props.value}
        onChange={props.onChange}
        readOnly={props.readOnly}
      />
      {props.label && (
        <label className={styles.label} htmlFor={props.id}>
          {props.label}
        </label>
      )}
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .container {
    display: block;
    margin-top: $unit-2;
  }

  .label {
    font-weight: bold;
    display: inline-block;
    margin-left: $unit-half;
  }

  .input {
    padding: $unit;
    display: inline-block;
    font-size: inherit;
    border: none;
    border-radius: $unit-half;
    background: rgba(0, 0, 0, 0.05);
  }
`;
