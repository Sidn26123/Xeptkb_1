import { createContext } from "react";

export const SidebarContext = createContext({});

export function SidebarProvider({ children }) {
  // Minimal sidebar provider; expand with state when needed
  return (
    <SidebarContext.Provider value={{}}>
      {children}
    </SidebarContext.Provider>
  );
}

export default SidebarProvider;
