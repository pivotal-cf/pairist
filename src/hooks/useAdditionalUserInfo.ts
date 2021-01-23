import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '../firebase';
import { AdditionalUserInfo } from '../types';

export function useAdditionalUserInfo(userId: string) {
  const localStorageTheme = localStorage.getItem('pairist-theme-selection');
  const themeDefault = localStorageTheme ? localStorageTheme : 'light';

  const [value = {identiconString: '', theme: themeDefault}, loading, error] = useDocumentData<AdditionalUserInfo>(
    db.collection('additionalUserInfo').doc(userId || '-')
  );

  if (error || loading) {
    error && console.error(error);
    return value;
  }

  return {
    identiconString: value.identiconString,
    theme: value.theme,
  };
}
