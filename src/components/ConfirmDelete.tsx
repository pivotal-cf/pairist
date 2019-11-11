import React from 'react';
import { useModal } from '../hooks/useModal';
import Button from './Button';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';

interface Props {
  title?: string;
  action: string;
  onConfirm: () => any;
}

export default function ConfirmDelete(props: Props) {
  const [, setModalContent] = useModal();

  function cancel() {
    setModalContent(null);
  }

  async function confirm() {
    await props.onConfirm();
    setModalContent(null);
  }

  return (
    <div>
      <ModalHeader text={props.title || 'Confirm'} />

      <ModalBody>Are you sure you want to {props.action}?</ModalBody>

      <ModalFooter>
        <Button onClick={cancel}>Cancel</Button>
        <Button type="submit" bold flavor="danger" onClick={confirm}>
          Confirm
        </Button>
      </ModalFooter>
    </div>
  );
}
