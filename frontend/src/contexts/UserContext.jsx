import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [activeUser, setActiveUser] = useState(() => {
    return localStorage.getItem('upsc-active-user') || 'Vishal';
  });

  useEffect(() => {
    localStorage.setItem('upsc-active-user', activeUser);
    document.documentElement.setAttribute('data-user', activeUser.toLowerCase());
  }, [activeUser]);

  return (
    <UserContext.Provider value={{ activeUser, setActiveUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
