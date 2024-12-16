import {
  createContext, useEffect, useMemo, useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { node } from 'prop-types';
import { auth } from '../firebase';

export const UserContext = createContext();

export default function UserContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('user') ? JSON.stringify(localStorage.getItem('user')) : null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user?.toJSON() || null);
      localStorage.setItem('user', JSON.stringify(user?.toJSON()) || null);
    });
  }, []);

  useEffect(() => {
    if (window?.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      setDarkMode(event.matches);
    });
  }, []);

  const passedVals = useMemo(() => ({ currentUser, darkMode }), [currentUser, darkMode]);

  return <UserContext.Provider value={passedVals}>{children}</UserContext.Provider>;
}

UserContextProvider.propTypes = {
  children: node.isRequired,
};
