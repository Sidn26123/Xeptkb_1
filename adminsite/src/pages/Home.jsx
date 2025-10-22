
import PageMeta from "../components/common/PageMeta.jsx";

// Home.jsx
export default function Home() {
 return (
   <>
     <PageMeta title="Trang chủ" description="Trang tổng quan hệ thống quản lý trường học." />
     <div className="flex-1 grid grid-cols-12 gap-6">
      <div className="col-span-12 xl:col-span-7 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2">Thống kê tổng quan</h2>
          <p className="text-gray-600 dark:text-gray-300">Widget thống kê, biểu đồ, số liệu...</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2">Biểu đồ doanh thu tháng</h2>
          <p className="text-gray-600 dark:text-gray-300">Biểu đồ placeholder...</p>
        </div>
      </div>
      <div className="col-span-12 xl:col-span-5">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2">Mục tiêu tháng</h2>
          <p className="text-gray-600 dark:text-gray-300">Widget mục tiêu...</p>
        </div>
      </div>
      <div className="col-span-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2">Thống kê chi tiết</h2>
          <p className="text-gray-600 dark:text-gray-300">Biểu đồ chi tiết...</p>
        </div>
      </div>
    </div>
    </>
  );
}