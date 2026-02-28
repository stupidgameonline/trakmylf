import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ACCESS_CODE = 'Alpha#12345';
const AUTH_KEY = 'this-life-auth';
const ACCESS_CODE_KEY = 'this-life-access-code';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(AUTH_KEY) === 'true');

  const login = useCallback((code) => {
    if (code === ACCESS_CODE) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      sessionStorage.setItem(ACCESS_CODE_KEY, code);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(ACCESS_CODE_KEY);
    sessionStorage.removeItem('this-life-last-vision-date');
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      login,
      logout
    }),
    [isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
