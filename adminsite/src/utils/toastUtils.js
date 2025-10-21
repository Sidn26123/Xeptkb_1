import { toast } from 'sonner';

export const showSuccess = (message) => {
    toast.success(message || 'Thành công');
};

export const showError = (message) => {
    toast.error(message || 'Đã xảy ra lỗi!!');
};

export const showInfo = (message) => {
    toast.info(message || 'Thông tin');
};

export const showWarning = (message) => {
    toast.warning(message || 'Cảnh báo !');
};
