/**
 * 打卡数据层：项目与打卡记录的存取，统一封装本地存储
 */
var PROJECT_KEY = "checkin_projects";
var RECORD_KEY = "checkin_records";

/**
 * 生成唯一 ID：时间戳 + 随机数
 */
function generateId() {
  return Date.now() + "-" + Math.floor(Math.random() * 100000);
}

/**
 * 获取全部项目
 * @returns {Array}
 */
function getProjects() {
  var projects = wx.getStorageSync(PROJECT_KEY);
  return Array.isArray(projects) ? projects : [];
}

/**
 * 按 ID 获取单个项目，不存在返回 null
 */
function getProject(id) {
  var list = getProjects().filter(function (p) {
    return p.id === id;
  });
  return list.length ? list[0] : null;
}

/**
 * 保存新项目
 * @param {string} name 项目名称
 * @param {number} target 目标天数（正整数）
 * @returns {Object} 落库后的完整项目
 */
function saveProject(name, target) {
  var projects = getProjects();
  var project = {
    id: generateId(),
    name: name,
    target: target,
    created_at: Date.now()
  };
  projects.push(project);
  wx.setStorageSync(PROJECT_KEY, projects);
  return project;
}

/**
 * 删除项目，并连带删除该项目的全部打卡记录
 * @param {string} id 项目 ID
 */
function deleteProject(id) {
  var projects = getProjects().filter(function (p) {
    return p.id !== id;
  });
  wx.setStorageSync(PROJECT_KEY, projects);

  var records = getRecords().filter(function (r) {
    return r.project_id !== id;
  });
  wx.setStorageSync(RECORD_KEY, records);
}

/**
 * 获取全部打卡记录
 * @returns {Array}
 */
function getRecords() {
  var records = wx.getStorageSync(RECORD_KEY);
  return Array.isArray(records) ? records : [];
}

/**
 * 获取某项目的全部打卡记录
 * @param {string} projectId
 * @returns {Array}
 */
function getRecordsByProject(projectId) {
  return getRecords().filter(function (r) {
    return r.project_id === projectId;
  });
}

/**
 * 判断某项目在指定日期是否已打卡
 * @param {string} projectId
 * @param {string} date "YYYY-MM-DD"
 * @returns {boolean}
 */
function hasChecked(projectId, date) {
  return getRecords().some(function (r) {
    return r.project_id === projectId && r.date === date;
  });
}

/**
 * 保存一条打卡记录（防重复：同项目同日期只能打卡一次）
 * @param {string} projectId
 * @param {string} date "YYYY-MM-DD"
 * @param {string} note 备注（可选）
 * @returns {Object|null} 成功返回记录对象，重复打卡返回 null
 */
function saveCheckin(projectId, date, note) {
  if (hasChecked(projectId, date)) {
    return null;
  }
  var records = getRecords();
  var record = {
    id: generateId(),
    project_id: projectId,
    date: date,
    note: note || "",
    created_at: Date.now()
  };
  records.push(record);
  wx.setStorageSync(RECORD_KEY, records);
  return record;
}

module.exports = {
  generateId: generateId,
  getProjects: getProjects,
  getProject: getProject,
  saveProject: saveProject,
  deleteProject: deleteProject,
  getRecords: getRecords,
  getRecordsByProject: getRecordsByProject,
  hasChecked: hasChecked,
  saveCheckin: saveCheckin
};
