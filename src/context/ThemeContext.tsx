import React, { createContext, useContext, useState } from 'react';
import { colors, darkColors } from '../theme/colors';
import type { ColorTheme } from '../theme/colors';

interface ThemeContextType {
  isDark: boolean;
  theme: ColorTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = (): void => {
    setIsDark((prev) => !prev);
  };

  const theme = isDark ? darkColors : colors;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit etre utilise dans un ThemeProvider');
  }
  return context;
};
