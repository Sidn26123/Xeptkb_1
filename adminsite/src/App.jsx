// App.jsx
import {BrowserRouter as Router} from 'react-router-dom';
import {AppWrapper} from "./components/common/PageMeta.jsx";
import {ThemeProvider} from "./context/ThemeContext.jsx";
import {SidebarProvider} from "./context/SidebarContext.jsx";
import AppRoutes from './routes/AppRoutes';
import {setSemesters, useSemesters} from "./stores/ScheduleDataStore.js";
import {getAllSemesters} from "./services/semesterService.js";
import {useEffect} from "react";

function App() {
    const semesters = useSemesters();

    const loadInitialData = () => {
        getAllSemesters().then(data => {
            setSemesters(data);
        });
    }
    useEffect(() => {
        loadInitialData();

    }, []);

    return (
        <Router>
            <ThemeProvider>
                <SidebarProvider>
                    <AppWrapper>
                        <AppRoutes/>
                    </AppWrapper>
                </SidebarProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
