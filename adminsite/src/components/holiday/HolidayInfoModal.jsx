import React from "react";
import Modal from "../ui/modal/index.jsx";
import Button from "../ui/button/Button.jsx";

export default function HolidayInfoModal({ isOpen, onClose, title, dateIso, description, ranges = [] }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg w-full mx-auto bg-white shadow">
      <div className="p-6 bg-white rounded">
        {title ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>
            <div className="text-sm text-gray-700 mb-2"><b>Ngày:</b> {dateIso}</div>
            {description && <div className="text-sm text-gray-600 mb-2"><b>Mô tả:</b> {description}</div>}
            {ranges.length > 0 && (
              <div className="text-sm text-gray-600 mb-2"><b>Khoảng:</b> {ranges.join(', ')}</div>
            )}
            <div className="flex justify-end mt-4">
              <Button onClick={onClose} variant="outline">Đóng</Button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-10">Không có thông tin</div>
        )}
      </div>
    </Modal>
  );
}
