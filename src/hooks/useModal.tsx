import React, { useContext, useState } from 'react';

const ModalContext = React.createContext<
  [React.ReactNode, React.Dispatch<React.SetStateAction<React.ReactNode>>]
>([null, () => {}]);

export const ModalProvider: React.FC = props => {
  const state = useState<React.ReactNode>(null);

  return <ModalContext.Provider value={state}>{props.children}</ModalContext.Provider>;
};

export const useModal = () => useContext(ModalContext);
