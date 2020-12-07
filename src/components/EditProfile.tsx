import { css } from 'astroturf';
import React, { FormEvent, useState } from 'react';
import * as userActions from '../actions/user';
import { auth } from '../firebase';
import { useModal } from '../hooks/useModal';
import { useSession } from '../hooks/useSession';
import Button from './Button';
import FormField from './FormField';
import Input from './Input';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';

export default function EditProfile() {
  const { loaded, userId, email, displayName, photoURL } = useSession();
  const [, setModalContent] = useModal();
  const [localDisplayName, setLocalDisplayName] = useState(displayName || '');
  const [localPhotoURL, setLocalPhotoURL] = useState(photoURL || '');
  const [submitting, setSubmitting] = useState(false);

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
      });

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
            <svg className={styles.image} width="80" height="80" data-jdenticon-value={userId} />
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
  }
`;
