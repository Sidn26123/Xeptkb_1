export function AppWrapper({ children }) {
  // Minimal wrapper: in adminsite this sets page meta; keep for structure parity
  return <>{children}</>;
}

export default AppWrapper;
