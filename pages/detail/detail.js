var storage = require("../../utils/storage.js");
var stats = require("../../utils/stats.js");
var dateUtil = require("../../utils/date.js");

var WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

Page({
  data: {
    projectId: "",
    project: null,
    total: 0,
    streak: 0,
    longest: 0,
    rate: 0,
    percent: 0,
    checkedToday: false,
    calendarTitle: "",
    calendarCells: [],
    canNextMonth: false,
    weekdays: WEEKDAYS,
    records: []
  },

  onLoad: function (options) {
    this.setData({
      projectId: options.id || ""
    });
  },

  onShow: function () {
    this.refresh();
  },

  onPullDownRefresh: function () {
    this.refresh();
    wx.stopPullDownRefresh();
  },

  /**
   * 全量刷新：项目信息、统计、日历、记录列表
   */
  refresh: function () {
    var project = storage.getProject(this.data.projectId);
    // 项目可能已被删除（例如从记录列表长按等入口删除后返回）
    if (!project) {
      wx.showToast({
        title: "项目不存在或已删除",
        icon: "none"
      });
      setTimeout(function () {
        wx.navigateBack();
      }, 600);
      return;
    }

    var records = storage.getRecordsByProject(project.id);
    // 记录按日期倒序
    var sorted = records.slice().sort(function (a, b) {
      return a.date < b.date ? 1 : -1;
    });
    var dates = records.map(function (r) {
      return r.date;
    });
    var total = dates.length;
    var rate = stats.completionRate(total, project.target);

    if (!this.data.calYear) {
      var now = new Date();
      this.calYear = now.getFullYear();
      this.calMonth = now.getMonth() + 1;
    }

    this.setData({
      project: {
        id: project.id,
        name: project.name,
        target: project.target,
        created_at: project.created_at
      },
      total: total,
      streak: stats.getStreak(dates),
      longest: stats.getLongestStreak(dates),
      rate: rate,
      percent: rate,
      checkedToday: storage.hasChecked(project.id, dateUtil.today()),
      records: sorted
    });
    this.buildCalendar();
  },

  /**
   * 构建日历单元格：首行空白补齐星期偏移，标记打卡/今天/未来
   */
  buildCalendar: function () {
    var year = this.calYear;
    var month = this.calMonth;
    var records = storage.getRecordsByProject(this.data.projectId);
    var noteMap = {};
    var checkedMap = {};
    records.forEach(function (r) {
      checkedMap[r.date] = true;
      noteMap[r.date] = r.note;
    });

    var todayStr = dateUtil.today();
    var firstWeekday = dateUtil.getFirstWeekday(year, month);
    var days = dateUtil.getDaysInMonth(year, month);
    var cells = [];
    var i;
    for (i = 0; i < firstWeekday; i++) {
      cells.push({ blank: true, day: "" });
    }
    for (var d = 1; d <= days; d++) {
      var dateStr = year + "-" + dateUtil.pad(month) + "-" + dateUtil.pad(d);
      cells.push({
        blank: false,
        day: d,
        date: dateStr,
        checked: !!checkedMap[dateStr],
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
        hasNote: !!noteMap[dateStr],
        note: noteMap[dateStr] || ""
      });
    }

    // 是否允许切换到下个月（不能看未来月份之后的月）
    var now = new Date();
    var canNext = year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1);

    this.setData({
      calendarTitle: dateUtil.formatMonthTitle(year, month),
      calendarCells: cells,
      canNextMonth: canNext
    });
  },

  onPrevMonth: function () {
    this.calMonth--;
    if (this.calMonth < 1) {
      this.calMonth = 12;
      this.calYear--;
    }
    this.buildCalendar();
  },

  onNextMonth: function () {
    if (!this.data.canNextMonth) {
      wx.showToast({
        title: "不能查看未来月份",
        icon: "none"
      });
      return;
    }
    this.calMonth++;
    if (this.calMonth > 12) {
      this.calMonth = 1;
      this.calYear++;
    }
    this.buildCalendar();
  },

  /**
   * 点击日历日期：查看当天打卡情况与备注
   */
  onTapDay: function (e) {
    var index = e.currentTarget.dataset.index;
    var cell = this.data.calendarCells[index];
    if (!cell || cell.blank) {
      return;
    }
    if (cell.isFuture) {
      wx.showToast({
        title: "还未到这一天",
        icon: "none"
      });
      return;
    }
    if (!cell.checked) {
      wx.showToast({
        title: "该日未打卡",
        icon: "none"
      });
      return;
    }
    wx.showModal({
      title: cell.date,
      content: cell.hasNote ? cell.note : "当日已打卡，未填写备注",
      showCancel: false,
      confirmText: "知道了",
      confirmColor: "#07C160"
    });
  },

  /**
   * 今日打卡：弹窗输入备注（可选），防重复
   */
  onCheckin: function () {
    var id = this.data.projectId;
    if (storage.hasChecked(id, dateUtil.today())) {
      wx.showToast({
        title: "今天已经打过卡啦",
        icon: "none"
      });
      return;
    }
    var that = this;
    wx.showModal({
      title: "打卡 - " + this.data.project.name,
      editable: true,
      placeholderText: "写点什么记录这一刻（可选）",
      confirmText: "打卡",
      confirmColor: "#07C160",
      success: function (res) {
        if (!res.confirm) {
          return;
        }
        var note = (res.content || "").trim();
        var record = storage.saveCheckin(id, dateUtil.today(), note);
        if (!record) {
          wx.showToast({
            title: "今天已经打过卡啦",
            icon: "none"
          });
          return;
        }
        that.refresh();
        wx.showToast({
          title: "打卡成功",
          icon: "success"
        });
      }
    });
  },

  /**
   * 删除项目（连带删除全部打卡记录），二次确认
   */
  onDeleteProject: function () {
    var that = this;
    wx.showModal({
      title: "删除项目",
      content: "删除后将同时清除该项目的全部打卡记录，且无法恢复。确定删除吗？",
      confirmText: "删除",
      confirmColor: "#FA5151",
      success: function (res) {
        if (res.confirm) {
          storage.deleteProject(that.data.projectId);
          wx.showToast({
            title: "已删除",
            icon: "success"
          });
          setTimeout(function () {
            wx.navigateBack();
          }, 400);
        }
      }
    });
  }
});
