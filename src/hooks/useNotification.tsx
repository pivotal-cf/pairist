import {
  ReactNode,
  Dispatch,
  SetStateAction,
  FC,
  createContext,
  useContext,
  useState,
} from 'react';

const NotificationContext = createContext<[ReactNode, Dispatch<SetStateAction<ReactNode>>]>([
  null,
  () => {},
]);

export const NotificationProvider: FC = (props) => {
  const state = useState<ReactNode>(null);

  return (
    <NotificationContext.Provider value={state}>{props.children}</NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
