function formatDateDisplay(dateStr, pad = (n) => n.toString().padStart(2, '0')) {
    if (!dateStr) return "";
    // Accept YYYY-MM-DD or ISO strings or Date objects
    if (typeof dateStr === 'object' && dateStr instanceof Date) {
        return `${pad(dateStr.getDate())}/${pad(dateStr.getMonth() + 1)}/${dateStr.getFullYear()}`;
    }
    // If already in format DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    // If YYYY-MM-DD or ISO, extract date part
    const m = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
        const [_, year, month, day] = m;
        return `${day}/${month}/${year}`;
    }
    // Fallback: try Date parse and format
    const d = new Date(dateStr);
    if (!isNaN(d)) return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    return dateStr;
}

function toISODate(dateStr, pad) {
    if (!dateStr) return "";
    // If already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // If DD/MM/YYYY -> convert
    const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
        const [, day, month, year] = m;
        return `${year}-${month}-${day}`;
    }
    // Try parsing ISO/Date
    const d = new Date(dateStr);
    if (!isNaN(d)) {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    return dateStr;
}

export { formatDateDisplay, toISODate };