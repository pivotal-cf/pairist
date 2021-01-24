import { css } from 'astroturf';
import { CSSProperties } from 'react';
import { Select, MenuItem } from '@material-ui/core';
import { colors } from '../colors';
import { readableTextColor } from './TrackChip';

interface Props {
  id: string;
  value: string;
  onChange: (evt: any) => void;
};

export default function ColorSelect(props: Props) {
  return (
    <Select
      id={props.id}
      value={props.value}
      style={ { background: props.value, color: readableTextColor(props.value) } }
      onChange={props.onChange}
      className={styles.select}
    >
      {colors.map(c => {
        const style: CSSProperties = {
          background: c.value,
          color: readableTextColor(c.value),
        };
        return (
          <MenuItem
            value={c.value}
            key={c.value}
            style={style}
          >
              {c.name}
          </MenuItem>
        );
      })}
    </Select>
  );
}

const styles = css`
  @import '../variables.scss';

  .select {
    padding: 0 $unit;
    display: block;
    font-size: 1em;
    border: none;
    border-radius: $unit-half;
    width: 100%;
    width: stretch;
    min-width: $unit * 30;

    svg {
      display: none;
    }
  }
`;
