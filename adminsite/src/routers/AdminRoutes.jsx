import { Route } from 'react-router-dom';
import AdminLayout from '../components/Layout.jsx';
import ProtectedRoute from '../commons/ProtectedRoute.jsx';
import { InputTaking } from '../components/admin/InputComponent.jsx';
import SchedulerResourcesManagement from '../components/admin/SchedulerResources.jsx';

const adminRoutesPrefix = '/admin';

const AdminRoutes = () => {
    return (
        <Route element={<ProtectedRoute isAllowed={true} />}>
            <Route element={<AdminLayout />}>
                {/*<Route path={`${adminRoutesPrefix}/dashboard`} element={<Dashboard />} />*/}
                <Route
                    path={`${adminRoutesPrefix}/inputs`}
                    element={<InputTaking />}
                />
                <Route
                    path={`${adminRoutesPrefix}/xep-lich`}
                    element={<SchedulerResourcesManagement />}
                />

                {/* <Route path="settings" element={<Settings />} /> */}
            </Route>
        </Route>
    );
};

export default AdminRoutes;
