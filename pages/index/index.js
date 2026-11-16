var storage = require("../../utils/storage.js");
var stats = require("../../utils/stats.js");
var dateUtil = require("../../utils/date.js");

Page({
  data: {
    projects: [],
    isEmpty: true
  },

  onShow: function () {
    this.refresh();
  },

  onPullDownRefresh: function () {
    this.refresh();
    wx.stopPullDownRefresh();
    wx.showToast({
      title: "已刷新",
      icon: "none"
    });
  },

  /**
   * 全量重算项目列表（数据量小，onShow 整体刷新即可）
   */
  refresh: function () {
    var today = dateUtil.today();
    var list = storage.getProjects().map(function (project) {
      var records = storage.getRecordsByProject(project.id);
      var dates = records.map(function (r) {
        return r.date;
      });
      var total = dates.length;
      var percent = stats.completionRate(total, project.target);
      return {
        id: project.id,
        name: project.name,
        target: project.target,
        checkedToday: storage.hasChecked(project.id, today),
        streak: stats.getStreak(dates),
        total: total,
        rate: percent,
        percent: percent
      };
    });
    this.setData({
      projects: list,
      isEmpty: list.length === 0
    });
  },

  /**
   * 打卡：弹窗输入备注（可选），防重复
   */
  onCheckin: function (e) {
    var id = e.currentTarget.dataset.id;
    var project = storage.getProject(id);
    if (!project) {
      return;
    }
    if (storage.hasChecked(id, dateUtil.today())) {
      wx.showToast({
        title: "今天已经打过卡啦",
        icon: "none"
      });
      return;
    }
    var that = this;
    wx.showModal({
      title: "打卡 - " + project.name,
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
   * 点击卡片主体进入详情页
   */
  onOpenDetail: function (e) {
    wx.navigateTo({
      url: "/pages/detail/detail?id=" + e.currentTarget.dataset.id
    });
  },

  /**
   * 跳转添加项目页
   */
  onAdd: function () {
    wx.navigateTo({
      url: "/pages/add/add"
    });
  }
});
