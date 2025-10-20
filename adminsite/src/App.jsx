import './App.css';
import Sidebar from './components/admin/Sidebar.jsx';
import AdminLayout from './components/Layout.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRoutes from './routers/AdminRoutes';
import { ToastContainer } from 'react-toastify';
import { useTheme } from './stores/themeStore.js';
import { useEffect } from 'react';

function App() {
    const theme = useTheme();

    // Theo dõi theme và cập nhật class HTML
    // useEffect(() => {
    //     // document.documentElement.classList.toggle('dark', theme === 'dark');
    //     document.documentElement.classList.toggle('light', theme === 'light');
    // }, [theme]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <>
            {/*<div className="flex">*/}
            {/*<AdminLayout />*/}
            {/*</div>*/}
            <>
                <Router>
                    <Routes>
                        {AdminRoutes()}
                        {/*<Route path="/500" element={<Page500 />} />*/}
                        {/*<Route path="/404" element={<Page404 />} />*/}
                        {/*<Route path="*" element={<Page404 />} />*/}
                    </Routes>
                </Router>
            </>
            <ToastContainer />
        </>
    );
}

export default App;
