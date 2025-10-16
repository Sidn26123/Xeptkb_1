import React, { useState } from 'react';
import { Menu, X, Home, Users, Settings, FileText } from 'lucide-react';
import Sidebar from './admin/Sidebar.jsx';
import { Outlet } from 'react-router-dom';

import Content from './admin/SchedulerResources.jsx';

// const Sidebar = ({ isOpen, toggleSidebar }) => {
//     return (
//         <div
//             className={`${
//                 isOpen ? 'translate-x-0' : '-translate-x-full'
//             } fixed lg:relative lg:translate-x-0 z-30 w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out flex flex-col h-full`}
//         >
//             <div className="flex items-center justify-between p-4 border-b border-gray-700">
//                 <h2 className="text-xl font-bold">My App</h2>
//                 <button
//                     onClick={toggleSidebar}
//                     className="lg:hidden text-white hover:bg-gray-700 p-2 rounded"
//                 >
//                     <X size={20} />
//                 </button>
//             </div>
//
//             <nav className="p-4 flex-1 overflow-y-auto">
//                 <ul className="space-y-2">
//                     <li>
//                         <a
//                             href="#"
//                             className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition-colors"
//                         >
//                             <Home size={20} />
//                             <span>Dashboard</span>
//                         </a>
//                     </li>
//                     <li>
//                         <a
//                             href="#"
//                             className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition-colors"
//                         >
//                             <Users size={20} />
//                             <span>Users</span>
//                         </a>
//                     </li>
//                     <li>
//                         <a
//                             href="#"
//                             className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition-colors"
//                         >
//                             <FileText size={20} />
//                             <span>Documents</span>
//                         </a>
//                     </li>
//                     <li>
//                         <a
//                             href="#"
//                             className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition-colors"
//                         >
//                             <Settings size={20} />
//                             <span>Settings</span>
//                         </a>
//                     </li>
//                 </ul>
//             </nav>
//         </div>
//     );
// };

const Navbar = ({ toggleSidebar }) => {
    return (
        <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden text-gray-700 hover:bg-gray-100 p-2 rounded"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-2xl font-semibold text-gray-800">
                    Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="text-gray-600 hover:text-gray-800">
                    Notifications
                </button>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    U
                </div>
            </div>
        </div>
    );
};

// const Content = () => {
//     return (
//         <div className="p-6  h-full bg-gray-50 text-gray-300">
//             <div></div>
//         </div>
//     );
// };

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex min-h-screen w-screen overflow-hidden">
            {/* Sidebar */}
            {/*<Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />*/}
            <Sidebar />
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                {/*<Navbar toggleSidebar={toggleSidebar} />*/}

                {/* children */}
                {/*<div className="flex-1 overflow-auto bg-gray-900 text-white">*/}
                {/*    {children ? children : <Content />}*/}
                {/*</div>*/}
                <div className="flex flex-col p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
