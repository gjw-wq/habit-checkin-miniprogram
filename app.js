App({
  onLaunch: function () {
    // 启动时预检本地数据结构，避免脏数据导致异常
    var projects = wx.getStorageSync("checkin_projects");
    if (!Array.isArray(projects)) {
      wx.setStorageSync("checkin_projects", []);
    }
    var records = wx.getStorageSync("checkin_records");
    if (!Array.isArray(records)) {
      wx.setStorageSync("checkin_records", []);
    }
  }
});
