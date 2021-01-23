import { css } from 'astroturf';
import { useState } from 'react';
import { emojis } from '../emojis';
import Button from './Button';
import EmojiMenu from './EmojiMenu';

interface Props {
  selected: string;
  onSelect: (emojiName: string) => void;
}

export default function EmojiPicker(props: Props) {
  const [expanded, setExpanded] = useState(false);

  let popup = null;

  if (expanded) {
    popup = (
      <EmojiMenu
        onSelect={(name) => {
          setExpanded(false);
          name && props.onSelect(name);
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      <Button className={styles.triggerBtn} onClick={() => setExpanded(!expanded)}>
        {emojis[props.selected]}
      </Button>

      {popup}
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .container {
    position: relative;
  }

  .triggerBtn {
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
    text-align: center;
    display: flex;
    justify-content: center;

    &:hover {
      background: var(--color-border);
    }
  }
`;
