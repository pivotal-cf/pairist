import React, {
  ReactNode,
  Dispatch,
  SetStateAction,
  FC,
  createContext,
  useContext,
  useState,
} from 'react';

const ModalContext = createContext<[ReactNode, Dispatch<SetStateAction<ReactNode>>]>([
  null,
  () => {},
]);

export const ModalProvider: FC = (props) => {
  const state = useState<ReactNode>(null);

  return <ModalContext.Provider value={state}>{props.children}</ModalContext.Provider>;
};

export const useModal = () => useContext(ModalContext);
