import React from "react";
import PageMeta from "../components/common/PageMeta.jsx";
import ResearchScheduleHub from "../components/researchSchedule/ResearchScheduleHub.jsx";
import ClassSchedule from "../components/researchSchedule/ClassSchedule.jsx";
import RoomSchedule from "../components/researchSchedule/RoomSchedule.jsx";
import TeacherSchedule from "../components/researchSchedule/TeacherSchedule.jsx";

export default function ResearchScheduleManagement() {
  const [viewType, setViewType] = React.useState(null); // null = hub

  const renderView = () => {
    switch (viewType) {
      case 'class':
        return <ClassSchedule />;
      case 'room':
        return <RoomSchedule />;
      case 'teacher':
        return <TeacherSchedule />;
      default:
        return null;
    }
  };

  return (
    <>
      <PageMeta title="Research Schedule Management" description="Tra cứu và phân tích thời khóa biểu." />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tra cứu Thời khóa biểu</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Tìm kiếm và xem lịch học theo sinh viên, lớp, phòng hoặc giảng viên</p>
        </div>
        
        <div className="space-y-6">
          <ResearchScheduleHub onSelect={(type) => setViewType(type)} />

          <div className="w-full">
            {renderView() || (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-12 text-center border border-blue-100 dark:border-gray-600">
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-24 w-24 text-blue-400 dark:text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Bắt đầu tra cứu
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Vui lòng chọn một trong các loại tra cứu phía trên để xem thời khóa biểu
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
