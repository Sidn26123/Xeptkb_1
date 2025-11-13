import SchedulerViewer from "../components/admin/SchedulerViewer.jsx";
import AlgorithmInputSelector from "../components/scheduler/SchedulerInput.jsx";
import React from "react";
import ResourceManager from "../components/scheduler/ResourceManager.jsx";

import { useState } from 'react';
import {useSchedules} from "../stores/ScheduleDataStore.js";

const SchedulerPage = () => {
    const [activeTab, setActiveTab] = useState('viewer');
    const schedules = useSchedules();
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Scheduler Page</h1>

                {/* Tab Selection */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="flex space-x-8">

                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'resources'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Resource Manager
                        </button>
                        <button
                            onClick={() => setActiveTab('viewer')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'viewer'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Scheduler Viewer
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow p-6">
                    {activeTab === 'resources' && <ResourceManager/>}
                    {activeTab === 'viewer' && schedules.courses && <SchedulerViewer resultData ={schedules} />}

                </div>
            </div>
        </div>
    );
};

export default SchedulerPage;
