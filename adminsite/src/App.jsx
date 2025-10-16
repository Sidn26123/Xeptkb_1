import './App.css';
import Sidebar from './components/admin/Sidebar.jsx';
import AdminLayout from './components/Layout.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRoutes from './routers/AdminRoutes';
import { ToastContainer } from 'react-toastify';

function App() {
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
