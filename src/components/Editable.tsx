import { css } from 'astroturf';
import { ChangeEventHandler, FocusEvent, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../helpers';
import Textarea from './Textarea';

interface Props {
  id?: string;
  className?: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  markdown?: boolean;
}

export default function Editable(props: Props) {
  const [editing, setEditing] = useState(false);

  function stopEditing() {
    if (!props.value && props.onChange) {
      props.onChange({ target: { value: 'Untitled' } } as any);
    }

    setEditing(false);
  }

  function onTextFocus(evt: FocusEvent) {
    if (evt.target !== evt.currentTarget) return;
    setEditing(true);
  }

  return (
    <div>
      {editing ? (
        <Textarea
          autofocus
          className={cn(styles.input, props.className)}
          defaultValue={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          onBlur={stopEditing}
          onEnter={stopEditing}
        />
      ) : (
        <div tabIndex={0} onFocus={onTextFocus} className={styles.rendered}>
          {props.markdown ? (
            <ReactMarkdown
              source={props.value}
              unwrapDisallowed
              skipHtml
              allowedTypes={[
                'paragraph',
                'root',
                'text',
                'emphasis',
                'strong',
                'link',
                'list',
                'listItem',
                'inlineCode',
                'heading',
              ]}
            />
          ) : (
            props.value
          )}
        </div>
      )}
    </div>
  );
}

const styles = css`
  @import '../variables.scss';

  .input {
    padding: $unit;
    display: block;
    font-size: inherit;
    font-weight: inherit;
    border: none;
    border-radius: $unit-half;
    width: 100%;
    width: stretch;
    min-width: $unit * 30;
    background: transparent;
  }

  .rendered {
    padding: $unit;

    p {
      margin: 0;
    }
  }
`;
