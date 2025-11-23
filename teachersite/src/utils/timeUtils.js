/**
 * Time utilities for the teachersite frontend.
 * Centralise timezone-aware helpers here so they can be reused.
 */

/**
 * Return current date/time in Vietnam timezone as { dateStr: 'YYYY-MM-DD', timeStr: 'HH:MM' }
 */
export function getNowInVN() {
  const optsDate = { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' };
  const optsTime = { timeZone: 'Asia/Ho_Chi_Minh', hour12: false, hour: '2-digit', minute: '2-digit' };
  const dateParts = new Intl.DateTimeFormat('en-GB', optsDate).format(new Date()).split('/');
  // en-GB -> dd/MM/yyyy
  const [dd, mm, yyyy] = dateParts;
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const timeStr = new Intl.DateTimeFormat('en-GB', optsTime).format(new Date()); // HH:MM
  return { dateStr, timeStr };
}

export default { getNowInVN };
