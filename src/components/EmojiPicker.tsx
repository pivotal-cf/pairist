import { css } from 'astroturf';
import React, { useState } from 'react';
import { emojis } from '../emojis';
import Button from './Button';

interface Props {
  selected: string;
  onSelect: (emojiName: string) => void;
}

const emojiList = Object.entries(emojis);

export default function EmojiPicker(props: Props) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');

  let popup = null;

  if (expanded) {
    popup = (
      <div className={styles.emojiBox}>
        <input
          type="text"
          value={search}
          onChange={(evt) => setSearch(evt.target.value.toLowerCase())}
          className={styles.searchInput}
          placeholder="Search emojis..."
        />

        <div className={styles.emojiList}>
          {emojiList.map(([name, char]) => {
            if (!name.includes(search)) return null;

            return (
              <button
                type="button"
                className={styles.emojiBtn}
                key={name}
                title={name}
                onClick={() => {
                  setExpanded(false);
                  props.onSelect(name);
                }}
              >
                {char}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Button onClick={() => setExpanded(!expanded)}>{emojis[props.selected]}</Button>

      {popup}
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .container {
    position: relative;
  }

  .emojiBox {
    position: absolute;
    left: 0;
    bottom: 0;
    background: $color-light;
    border-radius: 4px;
    box-shadow: 0 0 8px 0px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: $unit;
  }

  .searchInput {
    width: 100%;
    padding: $unit;
    font-size: 0.8em;
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }

  .emojiList {
    height: $unit * 18;
    width: $unit * 21;
    overflow: scroll;
    padding-top: $unit;
  }

  .emojiBtn {
    appearance: none;
    font-size: 1.4em;
    width: $unit * 4;
    height: $unit * 4;
    line-height: $unit * 4;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background: $color-border;
    }
  }
`;
