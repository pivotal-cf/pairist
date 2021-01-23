import { css } from 'astroturf';
import { FormEvent, useEffect, useState } from 'react';
import * as userActions from '../actions/user';
import { useModal } from '../hooks/useModal';
import { useSession } from '../hooks/useSession';
import { useAdditionalUserInfo } from '../hooks/useAdditionalUserInfo';
import { setTheme } from '../actions/app';
import { cn } from '../helpers';
import { Triangle } from 'react-feather';
import Button from './Button';
import FormField from './FormField';
import Input from './Input';
import Select from './Select';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';
import IconButton from './IconButton';

export default function EditProfile() {
  const { loaded, userId, email, displayName, photoURL } = useSession();
  const { identiconString, theme } = useAdditionalUserInfo(userId);
  const [, setModalContent] = useModal();
  const [localDisplayName, setLocalDisplayName] = useState(displayName || '');
  const [localPhotoURL, setLocalPhotoURL] = useState(photoURL || '');
  const [localIdenticonString, setLocalIdenticonString] = useState(identiconString || '');
  const [localTheme, setLocalTheme] = useState(theme || 'light');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLocalIdenticonString(identiconString);
    setLocalTheme(theme);
  }, [identiconString, theme]);

  function cancel() {
    setModalContent(null);
  }

  async function save(evt?: FormEvent) {
    evt && evt.preventDefault();

    setSubmitting(true);

    try {
      await userActions.updateProfile({
        displayName: localDisplayName,
        photoURL: localPhotoURL,
      }, {
        identiconString: localIdenticonString,
        theme: localTheme,
      });
      setTheme(localTheme);

      // HACK: for some reason I can't yet figure out, the user image/display name
      // shown in the header won't update after editing user profile. The simplest thing
      // that worked is to force a refresh. Hacky, but I don't expect users to be editing
      // their profile too frequently, so it's okay for now.
      window.location.reload();
    } finally {
      setSubmitting(false);
    }

    setModalContent(null);
  }

  return (
    <form onSubmit={save}>
      <ModalHeader text="Edit profile" />

      <ModalBody row>
        <div className={styles.imageContainer}>
          {localPhotoURL ? (
            <img className={styles.image} src={localPhotoURL} alt="Profile" />
          ) : (
            <svg className={styles.image} width="80" height="80"
              data-jdenticon-value={localIdenticonString ? localIdenticonString : userId} />
          )}
        </div>
        <div>
          <FormField label="Email">
            <Input id="edit-profile-email" value={email || ''} readOnly disabled />
          </FormField>

          <FormField label="Display name">
            <Input
              id="edit-display-name"
              value={localDisplayName}
              onChange={(evt) => setLocalDisplayName(evt.target.value)}
            />
          </FormField>

          <FormField label="Photo URL">
            <Input
              id="edit-profile-photo-url"
              value={localPhotoURL}
              onChange={(evt) => setLocalPhotoURL(evt.target.value)}
            />
          </FormField>
        <div className={styles.advancedOptionsSection}>
          <IconButton
            label="Advanced options"
            icon={<Triangle className={cn(styles.optionsIcon, showAdvancedOptions && styles.optionsIconClicked)} />}
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} />
          <span className={styles.advancedOptionsHeader}><b>Advanced Options</b></span>
        </div>
          {showAdvancedOptions &&
            <div>
              <FormField label="Identicon string">
                <Input
                  id="edit-identicon-string"
                  value={localIdenticonString}
                  onChange={(evt) => setLocalIdenticonString(evt.target.value)}
                />
              </FormField>
              <FormField label="Theme">
                <Select
                  id="theme-selector"
                  value={localTheme}
                  values={[
                    { name: 'Light', value: 'light' },
                    { name: 'Dark', value: 'dark' }
                  ]}
                  onChange={(evt) => {
                    setLocalTheme(evt.target.value);
                  }}
                />
              </FormField>
            </div>
          }
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex-grow" />
        <Button onClick={cancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          disabled={!loaded || submitting}
          submitting={submitting}
          type="submit"
          bold
          flavor="confirm"
        >
          Save
        </Button>
      </ModalFooter>
    </form>
  );
}

const styles = css`
  @import '../variables.scss';

  .heading {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: inherit;
  }

  .imageContainer {
    width: 192px;
    height: 192px;
    margin-right: 16px;
  }

  .image {
    width: 192px;
    height: 192px;
    stroke: none;
  }

  .advancedOptionsSection {
    display: flex;
    margin: $unit 0 $unit-2 0;
  }

  .advancedOptionsHeader {
    margin-left: $unit-half;
    padding-top: $unit;
  }

  .optionsIcon {
    transition: 0.9s;
    transform: rotate(90deg);
    fill: var(--color-border);
  }

  .optionsIconClicked {
    transform: rotate(180deg);
  }
`;
