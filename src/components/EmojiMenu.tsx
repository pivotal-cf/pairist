import { css } from 'astroturf';
import { useEffect, useRef, useState } from 'react';
import { emojiList } from '../emojis';

interface Props {
  onSelect: (emojiName: string | null) => void;
}

export default function EmojiMenu(props: Props) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onSelect } = props;
  const searchTerms = search.split(/\s+/);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    const handleWindowClick = (evt: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(evt.target as Node)) {
        onSelect(null);
      }
    };

    window.addEventListener('click', handleWindowClick);

    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, [onSelect]);

  return (
    <div className={styles.emojiBox} ref={containerRef}>
      <input
        type="text"
        ref={inputRef}
        value={search}
        onChange={(evt) => setSearch(evt.target.value.toLowerCase())}
        className={styles.searchInput}
        placeholder="Search emojis..."
      />

      <div className={styles.emojiList}>
        {emojiList.map(([name, char]) => {
          if (!searchTerms.every((term) => name.includes(term))) return null;

          return (
            <button
              type="button"
              className={styles.emojiBtn}
              key={name}
              title={name}
              onClick={() => props.onSelect(name)}
            >
              {char}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .emojiBox {
    position: absolute;
    z-index: 9999;
    right: 0;
    top: 0;
    background: var(--color-theme);
    border-radius: $unit-half;
    box-shadow: 0 0 8px 0px rgba(var(--color-box-shadow), 0.2);
    border: 1px solid rgba(var(--color-box-shadow), 0.2);
    padding: $unit;
  }

  .searchInput {
    width: 100%;
    padding: $unit;
    font-size: 0.8em;
    border: none;
    color: var(--color-text);
    background-color: var(--color-theme);
    border-bottom: 1px solid rgba(var(--color-box-shadow), 0.2);
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
    border-radius: $unit-half;
    text-align: center;

    &:hover {
      background: var(--color-border);
    }
  }
`;
