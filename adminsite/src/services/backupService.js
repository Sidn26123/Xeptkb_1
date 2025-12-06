import authService from './authService';

const api = authService.apiClient;

export const getAllBackups = async () => {
    const res = await api.get('/backup/list');
    return res?.data?.data ?? [];
}

export const createBackup = async () => {
    const res = await api.post('/backup/create');
    return res?.data ?? null;
}

export const downloadBackup = (filename) => {
    // Vì là local file, ta mở tab mới gọi vào API download của Nodejs
    // Đảm bảo URL này đúng với đường dẫn API của bạn
    const downloadUrl = `http://localhost:5000/api/backup/download/${filename}`;
    window.open(downloadUrl, '_blank');

}

export const restoreBackup = async (filename) => {
    const res = await api.post('/backup/restore', { filename });
    return res?.data ?? null;
}

export const deleteBackup = async (filename) => {
    const res = await api.post('/backup/delete', { filename });
    return res?.data ?? null;
}