export const handleBackendErrors = (err, formInstance, setErrorsState = null) => {
    const data = err?.response?.data || {};
    const errors = data.errors;
    const message = data.message || data.error || err?.message || 'Lỗi từ server';

    // 1. Nếu có formInstance (React Hook Form)
    if (formInstance && typeof formInstance.setError === 'function') {
        if (Array.isArray(errors) && errors.length > 0) {
            errors.forEach((it) => {
                if (!it) return;
                // Normalize field name (backend trả về path, param, field...)
                const field = it.path || it.param || it.field || it.fieldName || it.key;
                const msg = it.msg || it.message || it.error || String(it);
                if (field) {
                    formInstance.setError(String(field), { type: "server", message: msg });
                }
            });
        } else {
            // Lỗi chung (root error)
            formInstance.setError("root.serverError", { type: "server", message });
        }
    }

    // 2. Nếu dùng State thông thường để hứng lỗi (cho các form thủ công)
    if (setErrorsState) {
        if (Array.isArray(errors)) {
            const map = {};
            errors.forEach(e => { if (e.field) map[e.field] = e.message; });
            setErrorsState(map);
        } else {
            setErrorsState(message);
        }
    }
};