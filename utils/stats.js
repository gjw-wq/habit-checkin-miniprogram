/**
 * 统计算法：连续天数、最长连续、完成率
 */
var dateUtil = require("./date.js");

/**
 * 连续打卡天数：从今天（已打卡）或昨天（今天未打卡）往前逐日检查，
 * 直到遇到没有打卡记录的日期为止
 * @param {Array<string>} dates 已打卡日期数组 "YYYY-MM-DD"
 * @returns {number}
 */
function getStreak(dates) {
  if (!dates.length) {
    return 0;
  }
  var set = {};
  dates.forEach(function (d) {
    set[d] = true;
  });

  var current = dateUtil.today();
  // 今天未打卡时不中断连续记录，从昨天起算
  if (!set[current]) {
    current = dateUtil.addDays(current, -1);
  }
  var streak = 0;
  while (set[current]) {
    streak++;
    current = dateUtil.addDays(current, -1);
  }
  return streak;
}

/**
 * 历史上最长连续打卡天数：排序去重后线性扫描
 * @param {Array<string>} dates
 * @returns {number}
 */
function getLongestStreak(dates) {
  if (!dates.length) {
    return 0;
  }
  var sorted = dates.slice().sort();
  var longest = 1;
  var current = 1;
  for (var i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1]) {
      if (dateUtil.diffDays(sorted[i], sorted[i - 1]) === 1) {
        current++;
      } else {
        current = 1;
      }
      if (current > longest) {
        longest = current;
      }
    }
  }
  return longest;
}

/**
 * 完成率：已打卡天数 / 目标天数，返回百分数（整数，向上封顶 100）
 * @param {number} total 已打卡天数
 * @param {number} target 目标天数
 * @returns {number}
 */
function completionRate(total, target) {
  if (!target || target <= 0) {
    return 0;
  }
  var rate = Math.round((total / target) * 100);
  return Math.min(rate, 100);
}

module.exports = {
  getStreak: getStreak,
  getLongestStreak: getLongestStreak,
  completionRate: completionRate
};
