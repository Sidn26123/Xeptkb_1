import { createContext } from "react";

export const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  // Minimal theme provider; expand later if needed
  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
