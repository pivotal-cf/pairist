import React, { useState } from 'react';
import { useModal } from '../hooks/useModal';
import Button from './Button';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';

interface Props {
  title?: string;
  action: string;
  deletingText?: string;
  onConfirm: () => any;
}

export default function ConfirmDelete(props: Props) {
  const [, setModalContent] = useModal();
  const [deleting, setDeleting] = useState(false);

  function cancel() {
    setModalContent(null);
  }

  async function confirm() {
    setDeleting(true);
    await props.onConfirm();
    setDeleting(false);
    setModalContent(null);
  }

  return (
    <div>
      <ModalHeader text={props.title || 'Confirm'} />

      <ModalBody>Are you sure you want to {props.action}?</ModalBody>

      <ModalFooter>
        <Button onClick={cancel} disabled={deleting}>
          Cancel
        </Button>
        <Button
          type="submit"
          bold
          flavor="danger"
          onClick={confirm}
          disabled={deleting}
          submitting={deleting}
          submittingText={props.deletingText || 'Deleting...'}
        >
          Confirm
        </Button>
      </ModalFooter>
    </div>
  );
}
