import { css } from 'astroturf';
import { ChangeEventHandler } from 'react';
import { cn } from '../helpers';

interface Props {
  id?: string;
  className?: string;
  value: string;
  values: { name: string; value: string }[];
  onChange: ChangeEventHandler<HTMLSelectElement>;
}

export default function Select(props: Props) {
  return (
    <select
      className={cn(styles.select, props.className)}
      id={props.id}
      value={props.value}
      onChange={props.onChange}
    >
      {props.values.map((option) => (
        <option key={option.value} value={option.value}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

const styles = css`
  @import '../variables.scss';

  .select {
    padding: $unit;
    display: block;
    font-size: 1em;
    border: none;
    border-radius: $unit-half;
    width: 100%;
    width: stretch;
    min-width: $unit * 30;
    appearance: none;
    background: rgba(0, 0, 0, 0.05);
  }
`;
