/**
 * 日期工具：统一 "YYYY-MM-DD" 字符串处理
 */

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}

/**
 * Date 对象 -> "YYYY-MM-DD"
 */
function formatDate(date) {
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}

/**
 * 今天的日期字符串
 */
function today() {
  return formatDate(new Date());
}

/**
 * 日期字符串 -> Date（split 后按本地时区构造，避免 iOS 解析差异）
 */
function parseDate(dateStr) {
  var parts = dateStr.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

/**
 * 在日期字符串基础上加减天数，返回新的 "YYYY-MM-DD"
 * @param {string} dateStr
 * @param {number} delta 可为负数
 */
function addDays(dateStr, delta) {
  var d = parseDate(dateStr);
  d.setDate(d.getDate() + delta);
  return formatDate(d);
}

/**
 * 计算两个日期字符串相差的天数（a - b）
 */
function diffDays(a, b) {
  var ms = parseDate(a).getTime() - parseDate(b).getTime();
  return Math.round(ms / 86400000);
}

/**
 * 某年某月的天数
 * @param {number} year
 * @param {number} month 1-12
 */
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * 某年某月 1 号是星期几（0 = 周日）
 */
function getFirstWeekday(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * 中文年月标题，例如 "2026年11月"
 */
function formatMonthTitle(year, month) {
  return year + "年" + month + "月";
}

module.exports = {
  pad: pad,
  formatDate: formatDate,
  today: today,
  parseDate: parseDate,
  addDays: addDays,
  diffDays: diffDays,
  getDaysInMonth: getDaysInMonth,
  getFirstWeekday: getFirstWeekday,
  formatMonthTitle: formatMonthTitle
};
