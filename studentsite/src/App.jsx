import { BrowserRouter as Router } from 'react-router-dom';
import { AppWrapper } from "./components/common/PageMeta.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { SidebarProvider } from "./context/SidebarContext.jsx";
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <SidebarProvider>
          <AppWrapper>
            <AppRoutes />
          </AppWrapper>
        </SidebarProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App
