var storage = require("../../utils/storage.js");

var DEFAULT_TARGET = 21;

Page({
  data: {
    name: "",
    target: "" + DEFAULT_TARGET
  },

  onNameInput: function (e) {
    this.setData({
      name: e.detail.value
    });
  },

  onTargetInput: function (e) {
    this.setData({
      target: e.detail.value
    });
  },

  /**
   * 创建项目并返回首页（首页 onShow 自动刷新）
   */
  onSave: function () {
    var name = this.data.name.trim();
    if (!name) {
      wx.showToast({
        title: "请输入项目名称",
        icon: "none"
      });
      return;
    }
    var target = Number(this.data.target);
    if (!this.data.target || isNaN(target) || target <= 0 || Math.floor(target) !== target) {
      wx.showToast({
        title: "目标天数需为正整数",
        icon: "none"
      });
      return;
    }
    storage.saveProject(name, target);
    wx.showToast({
      title: "创建成功",
      icon: "success"
    });
    setTimeout(function () {
      wx.navigateBack();
    }, 400);
  }
});
